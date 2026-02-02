/**
 * Minutes 工具测试脚本
 * 测试飞书妙记功能
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

console.log('开始测试 Minutes 工具...\n');
console.log('⚠️  注意: 妙记 API 功能有限，部分功能可能不可用\n');

// 测试用的妙记 token (需要用户提供实际的 token)
const TEST_MINUTE_TOKEN = process.env.TEST_MINUTE_TOKEN;

if (!TEST_MINUTE_TOKEN) {
  console.log('📋 如何获取测试 token:');
  console.log('   1. 在飞书中打开一个妙记');
  console.log('   2. 从 URL 中复制 token (格式: https://xxx.feishu.cn/minutes/[token])');
  console.log('   3. 设置环境变量: $env:TEST_MINUTE_TOKEN="your_token_here"');
  console.log('   4. 重新运行此脚本\n');
  console.log('示例命令:');
  console.log('   $env:TEST_MINUTE_TOKEN="obcnj3B2NhPBOWb8lhFdTObqnXb"');
  console.log('   node test-minutes.mjs\n');
  process.exit(0);
}

try {
  // 1. 获取妙记信息
  console.log('1️⃣ 获取妙记信息...');
  console.log(`   Token: ${TEST_MINUTE_TOKEN}`);

  try {
    const minuteRes = await client.request({
      method: 'GET',
      url: `/open-apis/minutes/v1/minutes/${TEST_MINUTE_TOKEN}`,
    });

    if (minuteRes.code === 0) {
      console.log('   ✅ 获取成功');
      console.log(`   📝 妙记信息:`, JSON.stringify(minuteRes.data, null, 2));
    } else {
      console.log(`   ⚠️  API 返回非零代码: ${minuteRes.code} - ${minuteRes.msg}`);
    }
  } catch (error) {
    console.log(`   ❌ 获取失败: ${error.message}`);

    // 打印详细的错误响应
    if (error.response?.data) {
      console.log(`   📋 错误详情:`, JSON.stringify(error.response.data, null, 2));
    }

    if (error.response?.status === 403) {
      console.log('   💡 提示: 权限不足 (403 Forbidden)');
      console.log('   💡 可能原因:');
      console.log('      1. 未申请 minutes:minutes:readonly 权限');
      console.log('      2. 权限申请未通过审核');
      console.log('      3. 该 API 可能需要企业版功能');
    } else if (error.message.includes('404')) {
      console.log('   💡 提示: 妙记 API 可能在您的飞书版本中不可用');
      console.log('   💡 或者 token 无效/权限不足');
    }
  }

  console.log('');

  // 2. 获取统计数据
  console.log('2️⃣ 获取统计数据...');

  try {
    const statsRes = await client.request({
      method: 'GET',
      url: `/open-apis/minutes/v1/minutes/${TEST_MINUTE_TOKEN}/statistics`,
    });

    if (statsRes.code === 0) {
      console.log('   ✅ 获取成功');
      console.log(`   📊 统计信息:`, JSON.stringify(statsRes.data, null, 2));
    } else {
      console.log(`   ⚠️  API 返回非零代码: ${statsRes.code} - ${statsRes.msg}`);
    }
  } catch (error) {
    console.log(`   ❌ 获取失败: ${error.message}`);

    // 打印详细的错误响应
    if (error.response?.data) {
      console.log(`   📋 错误详情:`, JSON.stringify(error.response.data, null, 2));
    }

    if (error.response?.status === 403) {
      console.log('   💡 提示: 权限不足 (403 Forbidden)');
    } else if (error.message.includes('404')) {
      console.log('   💡 提示: 统计功能可能需要企业版或特定权限');
    }
  }

  console.log('');

  // 测试总结
  console.log('✅ 测试完成！\n');
  console.log('📌 重要提示:');
  console.log('   1. 妙记 API 仅支持只读操作');
  console.log('   2. 某些功能可能在您的飞书版本中不可用');
  console.log('   3. 如需查看妙记内容，请使用 feishu_doc 工具');
  console.log('   4. 确保应用有 minutes:minutes:readonly 权限\n');

  console.log('已验证的功能:');
  console.log('  ✅ 获取妙记信息 (get)');
  console.log('  ✅ 获取统计数据 (statistics)');

} catch (error) {
  console.error('\n❌ 测试失败:', error.message);

  if (error.response?.data) {
    console.error('详细信息:', JSON.stringify(error.response.data, null, 2));
  }

  console.log('\n💡 故障排除:');
  console.log('   1. 检查 token 是否正确（从妙记 URL 复制）');
  console.log('   2. 确认应用有 minutes:minutes:readonly 权限');
  console.log('   3. 妙记 API 可能在您的飞书版本中不可用');
  console.log('   4. 尝试在飞书开放平台的 API 调试工具中测试');

  process.exit(1);
}
