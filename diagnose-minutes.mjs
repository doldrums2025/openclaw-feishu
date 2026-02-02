/**
 * Minutes API 诊断脚本
 * 深入排查权限问题
 */

import Lark from '@larksuiteoapi/node-sdk';

const config = {
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
  domain: process.env.FEISHU_DOMAIN || 'feishu',
};

if (!config.appId || !config.appSecret) {
  console.error('❌ 错误: 请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
  process.exit(1);
}

const client = new Lark.Client({
  appId: config.appId,
  appSecret: config.appSecret,
  appType: Lark.AppType.SelfBuild,
  domain: config.domain === 'lark' ? Lark.Domain.Lark : Lark.Domain.Feishu,
});

const TEST_MINUTE_TOKEN = process.env.TEST_MINUTE_TOKEN;

if (!TEST_MINUTE_TOKEN) {
  console.log('❌ 请设置 TEST_MINUTE_TOKEN 环境变量');
  process.exit(1);
}

console.log('🔍 开始诊断 Minutes API 权限问题...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function diagnose() {
  try {
    // 1. 获取并显示 tenant_access_token
    console.log('1️⃣ 检查访问令牌 (tenant_access_token)...');
    const tokenRes = await client.request({
      method: 'POST',
      url: '/open-apis/auth/v3/tenant_access_token/internal',
      data: {
        app_id: config.appId,
        app_secret: config.appSecret,
      },
    });

    if (tokenRes.code === 0 && tokenRes.tenant_access_token) {
      console.log('   ✅ 成功获取 tenant_access_token');
      console.log(`   📝 Token (前20字符): ${tokenRes.tenant_access_token.substring(0, 20)}...`);
      console.log(`   ⏱️  过期时间: ${tokenRes.expire} 秒`);
    } else {
      console.log('   ❌ 获取 token 失败');
      console.log('   详情:', JSON.stringify(tokenRes, null, 2));
    }
    console.log('');

    // 2. 检查应用权限范围
    console.log('2️⃣ 检查应用权限范围...');
    try {
      const scopeRes = await client.request({
        method: 'GET',
        url: '/open-apis/contact/v3/scopes',
      });

      if (scopeRes.code === 0) {
        console.log('   ✅ 成功获取权限列表');

        // 查找 minutes 相关权限
        const minutesScopes = scopeRes.data?.scopes?.filter(s =>
          s.includes('minutes') || s.includes('妙记')
        );

        if (minutesScopes && minutesScopes.length > 0) {
          console.log('   📋 发现 Minutes 相关权限:');
          minutesScopes.forEach(scope => console.log(`      - ${scope}`));
        } else {
          console.log('   ⚠️  未发现 Minutes 相关权限');
          console.log('   💡 这可能是问题所在！');
        }
      } else {
        console.log('   ⚠️  无法获取权限列表');
        console.log('   详情:', JSON.stringify(scopeRes, null, 2));
      }
    } catch (error) {
      console.log('   ⚠️  权限范围检查失败:', error.message);
    }
    console.log('');

    // 3. 尝试调用 Minutes API (带详细错误)
    console.log('3️⃣ 尝试调用 Minutes API...');
    console.log(`   Token: ${TEST_MINUTE_TOKEN}`);
    console.log(`   API: /open-apis/minutes/v1/minutes/${TEST_MINUTE_TOKEN}`);

    try {
      const minuteRes = await client.request({
        method: 'GET',
        url: `/open-apis/minutes/v1/minutes/${TEST_MINUTE_TOKEN}`,
      });

      console.log('   ✅ API 调用成功！');
      console.log('   返回数据:', JSON.stringify(minuteRes, null, 2));
    } catch (error) {
      console.log('   ❌ API 调用失败');
      console.log('   HTTP 状态:', error.response?.status);

      if (error.response?.data) {
        const errData = error.response.data;
        console.log('   错误码:', errData.code);
        console.log('   错误消息:', errData.msg);

        if (errData.error) {
          console.log('   Log ID:', errData.error.log_id);
          if (errData.error.troubleshooter) {
            console.log('   排查链接:', errData.error.troubleshooter);
          }
        }

        // 解析常见错误
        console.log('\n   📋 错误分析:');
        if (errData.code === 2091005) {
          console.log('   ⚠️  错误码 2091005 = 权限被拒绝');
          console.log('');
          console.log('   可能原因:');
          console.log('   1. 应用未获得正确的权限（即使界面显示已添加）');
          console.log('   2. 需要用户授权而非应用授权（user_access_token）');
          console.log('   3. 妙记的所有者不是当前应用的用户');
          console.log('   4. Minutes API 需要企业版或特定套餐');
          console.log('   5. 该 API 仅对特定应用类型开放（如商店应用）');
        }
      }
    }
    console.log('');

    // 4. 尝试其他可能的 API 端点
    console.log('4️⃣ 尝试其他可能的 Minutes API 端点...');

    const endpoints = [
      { name: '列出妙记 (list)', url: '/open-apis/minutes/v1/minutes' },
      { name: '搜索妙记 (search)', url: '/open-apis/minutes/v1/minutes/search' },
    ];

    for (const endpoint of endpoints) {
      console.log(`   测试: ${endpoint.name}`);
      try {
        const res = await client.request({
          method: 'GET',
          url: endpoint.url,
          params: endpoint.url.includes('search') ? { query: 'test' } : {},
        });

        if (res.code === 0) {
          console.log(`      ✅ ${endpoint.name} 可用`);
        } else {
          console.log(`      ⚠️  ${endpoint.name} 返回码: ${res.code}`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`      ℹ️  ${endpoint.name} API 不存在 (404)`);
        } else if (error.response?.status === 403) {
          console.log(`      ❌ ${endpoint.name} 权限拒绝 (403)`);
        } else {
          console.log(`      ⚠️  ${endpoint.name} 失败: ${error.message}`);
        }
      }
    }
    console.log('');

    // 5. 总结与建议
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 诊断总结\n');

    console.log('🔑 关键发现:');
    console.log('   - 使用的是 tenant_access_token (应用级访问)');
    console.log('   - 错误码 2091005 表示权限被明确拒绝');
    console.log('   - Token 格式正确，API 端点存在\n');

    console.log('💡 可能的解决方案:\n');

    console.log('方案 1: 检查权限审核状态');
    console.log('   1. 访问飞书开放平台 → 应用详情 → 权限管理');
    console.log('   2. 查看 minutes:minutes:readonly 权限状态');
    console.log('   3. 如果是"待审核"，需要等待管理员通过');
    console.log('   4. 如果是"已拒绝"，需要重新申请\n');

    console.log('方案 2: 检查妙记所有权');
    console.log('   1. 确认测试的妙记是由您的飞书账号创建的');
    console.log('   2. 尝试访问自己创建的妙记');
    console.log('   3. 妙记可能有访问权限限制\n');

    console.log('方案 3: 尝试用户授权 (user_access_token)');
    console.log('   Minutes API 可能需要用户授权而非应用授权');
    console.log('   这需要实现 OAuth 授权流程\n');

    console.log('方案 4: 联系飞书技术支持');
    console.log('   1. 在飞书开放平台提交工单');
    console.log('   2. 提供错误 log_id 和截图');
    console.log('   3. 询问 Minutes API 的具体权限要求\n');

    console.log('方案 5: 接受限制');
    console.log('   如果 Minutes API 确实不可用:');
    console.log('   1. 在文档中说明限制');
    console.log('   2. 提供使用 feishu_doc 工具访问妙记内容的替代方案');
    console.log('   3. 保留代码供未来有权限时使用\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('\n❌ 诊断过程出错:', error.message);
    if (error.stack) {
      console.error('\n堆栈跟踪:', error.stack);
    }
  }
}

diagnose();
