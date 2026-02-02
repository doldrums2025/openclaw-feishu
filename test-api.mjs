/**
 * API 验证测试脚本
 *
 * 用途: 验证飞书 Bitable、Calendar、Minutes API 的可用性
 *
 * 使用方法:
 * 1. 设置环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET
 * 2. 运行: node test-api.mjs
 *
 * 测试内容:
 * - Bitable API (多维表格)
 * - Calendar API (日历/会议)
 * - Minutes API (飞书妙记)
 */

import Lark from '@larksuiteoapi/node-sdk';

// ============ 配置 ============

const config = {
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
  // 如果使用国际版 Lark,改为 'lark'
  domain: process.env.FEISHU_DOMAIN || 'feishu',
};

// ============ 初始化客户端 ============

if (!config.appId || !config.appSecret) {
  console.error('❌ 错误: 请设置环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
  console.log('\n使用方法:');
  console.log('  export FEISHU_APP_ID=cli_xxx');
  console.log('  export FEISHU_APP_SECRET=xxx');
  console.log('  node test-api.mjs');
  process.exit(1);
}

const client = new Lark.Client({
  appId: config.appId,
  appSecret: config.appSecret,
  appType: Lark.AppType.SelfBuild,
  domain: config.domain === 'lark' ? Lark.Domain.Lark : Lark.Domain.Feishu,
});

console.log('✅ 飞书客户端初始化成功');
console.log(`   App ID: ${config.appId.substring(0, 10)}...`);
console.log(`   Domain: ${config.domain}\n`);

// ============ 测试结果记录 ============

const results = {
  bitable: {},
  calendar: {},
  minutes: {},
};

// ============ 辅助函数 ============

/**
 * 安全执行 API 调用并记录结果
 */
async function testApi(category, apiName, fn) {
  try {
    console.log(`🔍 测试 ${category}.${apiName}...`);
    const result = await fn();
    results[category][apiName] = {
      success: true,
      code: result.code,
      message: result.msg || 'OK',
      data: result.data,
    };
    console.log(`   ✅ 成功 (code: ${result.code})`);
    return result;
  } catch (error) {
    results[category][apiName] = {
      success: false,
      error: error.message,
      code: error.code,
    };
    console.log(`   ❌ 失败: ${error.message}`);
    return null;
  }
}

/**
 * 打印 API 响应示例
 */
function printSample(title, data, maxDepth = 2) {
  console.log(`\n📋 ${title}:`);
  console.log(JSON.stringify(data, null, 2).split('\n').slice(0, 20).join('\n'));
  if (JSON.stringify(data).length > 1000) {
    console.log('   ... (truncated)');
  }
}

// ============ Bitable (多维表格) 测试 ============

async function testBitable() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试 Bitable API (多维表格)');
  console.log('='.repeat(60) + '\n');

  // 测试 1: 列出应用 (需要一个测试 app_token)
  const testAppToken = process.env.FEISHU_TEST_BITABLE_APP_TOKEN;

  if (!testAppToken) {
    console.log('⚠️  跳过 Bitable 测试: 未设置 FEISHU_TEST_BITABLE_APP_TOKEN');
    console.log('   请在飞书中创建一个测试多维表格,然后设置环境变量');
    console.log('   export FEISHU_TEST_BITABLE_APP_TOKEN=bascnxxx\n');
    results.bitable.skipped = true;
    return;
  }

  // 1.1 列出数据表
  const listTablesRes = await testApi('bitable', 'listTables', async () => {
    return await client.bitable.appTable.list({
      path: { app_token: testAppToken },
    });
  });

  if (listTablesRes?.data?.items?.length > 0) {
    const firstTable = listTablesRes.data.items[0];
    printSample('数据表列表示例', firstTable);

    // 1.2 列出字段
    await testApi('bitable', 'listFields', async () => {
      return await client.bitable.appTableField.list({
        path: {
          app_token: testAppToken,
          table_id: firstTable.table_id,
        },
      });
    });

    // 1.3 列出记录
    const listRecordsRes = await testApi('bitable', 'listRecords', async () => {
      return await client.bitable.appTableRecord.list({
        path: {
          app_token: testAppToken,
          table_id: firstTable.table_id,
        },
        params: { page_size: 10 },
      });
    });

    if (listRecordsRes?.data?.items?.length > 0) {
      printSample('记录示例', listRecordsRes.data.items[0]);
    }

    // 1.4 创建记录 (测试写入权限)
    await testApi('bitable', 'createRecord', async () => {
      return await client.bitable.appTableRecord.create({
        path: {
          app_token: testAppToken,
          table_id: firstTable.table_id,
        },
        data: {
          fields: { "测试字段": "API测试数据" },
        },
      });
    });

    // 1.5 批量创建记录
    await testApi('bitable', 'batchCreateRecords', async () => {
      return await client.bitable.appTableRecord.batchCreate({
        path: {
          app_token: testAppToken,
          table_id: firstTable.table_id,
        },
        data: {
          records: [
            { fields: { "测试字段": "批量测试1" } },
            { fields: { "测试字段": "批量测试2" } },
          ],
        },
      });
    });
  }
}

// ============ Calendar (日历) 测试 ============

async function testCalendar() {
  console.log('\n' + '='.repeat(60));
  console.log('📅 测试 Calendar API (日历/会议)');
  console.log('='.repeat(60) + '\n');

  // 2.1 列出日历
  const listCalendarsRes = await testApi('calendar', 'listCalendars', async () => {
    return await client.calendar.calendar.list();
  });

  if (listCalendarsRes?.data?.calendar_list?.length > 0) {
    const primaryCalendar = listCalendarsRes.data.calendar_list.find(
      (cal) => cal.role === 'owner'
    ) || listCalendarsRes.data.calendar_list[0];

    printSample('日历列表示例', primaryCalendar);

    const calendarId = primaryCalendar.calendar_id;

    // 2.2 列出日程
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const listEventsRes = await testApi('calendar', 'listEvents', async () => {
      return await client.calendar.calendarEvent.list({
        path: { calendar_id: calendarId },
        params: {
          start_time: Math.floor(now.getTime() / 1000).toString(),
          end_time: Math.floor(tomorrow.getTime() / 1000).toString(),
        },
      });
    });

    if (listEventsRes?.data?.items?.length > 0) {
      printSample('日程列表示例', listEventsRes.data.items[0]);
    }

    // 2.3 创建日程 (测试写入权限)
    const testStartTime = Math.floor((now.getTime() + 60 * 60 * 1000) / 1000);
    const testEndTime = testStartTime + 3600; // 1小时

    const createEventRes = await testApi('calendar', 'createEvent', async () => {
      return await client.calendar.calendarEvent.create({
        path: { calendar_id: calendarId },
        data: {
          summary: 'API测试会议',
          description: '这是一个测试会议',
          start_time: {
            timestamp: testStartTime.toString(),
          },
          end_time: {
            timestamp: testEndTime.toString(),
          },
        },
      });
    });

    if (createEventRes?.data?.event) {
      const eventId = createEventRes.data.event.event_id;
      printSample('创建的日程', createEventRes.data.event);

      // 2.4 获取日程详情
      await testApi('calendar', 'getEvent', async () => {
        return await client.calendar.calendarEvent.get({
          path: {
            calendar_id: calendarId,
            event_id: eventId,
          },
        });
      });

      // 2.5 更新日程
      await testApi('calendar', 'updateEvent', async () => {
        return await client.calendar.calendarEvent.patch({
          path: {
            calendar_id: calendarId,
            event_id: eventId,
          },
          data: {
            summary: 'API测试会议(已修改)',
          },
        });
      });

      // 2.6 删除日程
      await testApi('calendar', 'deleteEvent', async () => {
        return await client.calendar.calendarEvent.delete({
          path: {
            calendar_id: calendarId,
            event_id: eventId,
          },
        });
      });
    }

    // 2.7 查询忙闲
    await testApi('calendar', 'getFreebusy', async () => {
      return await client.calendar.freebusy.list({
        data: {
          time_min: now.toISOString(),
          time_max: tomorrow.toISOString(),
          user_id: 'me',
        },
      });
    });
  }
}

// ============ Minutes (飞书妙记) 测试 ============

async function testMinutes() {
  console.log('\n' + '='.repeat(60));
  console.log('🎙️  测试 Minutes API (飞书妙记)');
  console.log('='.repeat(60) + '\n');

  const testMinuteToken = process.env.FEISHU_TEST_MINUTE_TOKEN;

  if (!testMinuteToken) {
    console.log('⚠️  跳过 Minutes 测试: 未设置 FEISHU_TEST_MINUTE_TOKEN');
    console.log('   请在飞书中创建一个测试妙记,然后设置环境变量');
    console.log('   export FEISHU_TEST_MINUTE_TOKEN=obcnxxx\n');
    results.minutes.skipped = true;
    return;
  }

  // 3.1 获取妙记信息
  const getMinuteRes = await testApi('minutes', 'getMinute', async () => {
    // 注意: Minutes API 可能使用自定义路径
    return await client.request({
      method: 'GET',
      url: `/open-apis/minutes/v1/minutes/${testMinuteToken}`,
    });
  });

  if (getMinuteRes?.data) {
    printSample('妙记信息', getMinuteRes.data);
  }

  // 3.2 获取统计信息
  await testApi('minutes', 'getStatistics', async () => {
    return await client.request({
      method: 'GET',
      url: `/open-apis/minutes/v1/minutes/${testMinuteToken}/statistics`,
    });
  });

  // 3.3 尝试列出妙记 (可能不可用)
  await testApi('minutes', 'listMinutes', async () => {
    return await client.request({
      method: 'GET',
      url: '/open-apis/minutes/v1/minutes',
    });
  });
}

// ============ 主测试流程 ============

async function main() {
  console.log('开始 API 验证测试...\n');

  try {
    await testBitable();
    await testCalendar();
    await testMinutes();
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
  }

  // 输出总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果总结');
  console.log('='.repeat(60) + '\n');

  const categories = ['bitable', 'calendar', 'minutes'];
  const categoryNames = {
    bitable: 'Bitable (多维表格)',
    calendar: 'Calendar (日历)',
    minutes: 'Minutes (妙记)',
  };

  for (const cat of categories) {
    console.log(`\n${categoryNames[cat]}:`);
    if (results[cat].skipped) {
      console.log('  ⚠️  已跳过 (未配置测试数据)');
      continue;
    }

    const apis = Object.keys(results[cat]);
    const successCount = apis.filter((api) => results[cat][api].success).length;
    const failCount = apis.length - successCount;

    console.log(`  总计: ${apis.length} 个 API`);
    console.log(`  成功: ${successCount} ✅`);
    console.log(`  失败: ${failCount} ❌`);

    if (failCount > 0) {
      console.log('\n  失败的 API:');
      apis
        .filter((api) => !results[cat][api].success)
        .forEach((api) => {
          console.log(`    - ${api}: ${results[cat][api].error}`);
        });
    }
  }

  // 保存结果到文件
  const fs = await import('fs');
  const outputPath = './api-test-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 详细结果已保存到: ${outputPath}`);

  console.log('\n✅ 测试完成!');
  console.log('\n下一步:');
  console.log('  1. 查看 api-test-results.json 获取详细结果');
  console.log('  2. 根据测试结果创建 API-VERIFICATION.md 文档');
  console.log('  3. 开始实施功能开发\n');
}

// 运行测试
main().catch(console.error);
