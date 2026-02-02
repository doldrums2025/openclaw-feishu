/**
 * Bitable 工具快速测试脚本
 *
 * 用途: 快速验证 Bitable API 功能
 *
 * 使用方法:
 * 1. 设置环境变量
 *    export FEISHU_APP_ID=cli_xxx
 *    export FEISHU_APP_SECRET=xxx
 *    export FEISHU_TEST_BITABLE_APP_TOKEN=bascnxxx
 *
 * 2. 运行: node test-bitable.mjs
 */

import Lark from '@larksuiteoapi/node-sdk';

// ============ 配置 ============

const config = {
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
  appToken: process.env.FEISHU_TEST_BITABLE_APP_TOKEN,
  domain: process.env.FEISHU_DOMAIN || 'feishu',
};

// ============ 验证配置 ============

if (!config.appId || !config.appSecret) {
  console.error('❌ 错误: 请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
  process.exit(1);
}

if (!config.appToken) {
  console.error('❌ 错误: 请设置 FEISHU_TEST_BITABLE_APP_TOKEN');
  console.log('\n如何获取:');
  console.log('  1. 在飞书中创建多维表格');
  console.log('  2. 从 URL 提取 app_token: https://xxx.feishu.cn/base/[bascnXXX]');
  console.log('  3. export FEISHU_TEST_BITABLE_APP_TOKEN=bascnxxx');
  process.exit(1);
}

// ============ 初始化客户端 ============

const client = new Lark.Client({
  appId: config.appId,
  appSecret: config.appSecret,
  appType: Lark.AppType.SelfBuild,
  domain: config.domain === 'lark' ? Lark.Domain.Lark : Lark.Domain.Feishu,
});

console.log('✅ 飞书客户端初始化成功');
console.log(`   App Token: ${config.appToken}\n`);

// ============ 测试状态 ============

const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

// ============ 辅助函数 ============

async function runTest(name, fn) {
  try {
    console.log(`\n🔍 测试: ${name}`);
    const result = await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed', result });
    console.log(`   ✅ 通过`);
    return result;
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
    console.log(`   ❌ 失败: ${error.message}`);
    return null;
  }
}

function printJson(data, maxLines = 10) {
  const json = JSON.stringify(data, null, 2);
  const lines = json.split('\n');
  if (lines.length > maxLines) {
    console.log(lines.slice(0, maxLines).join('\n'));
    console.log(`   ... (省略 ${lines.length - maxLines} 行)`);
  } else {
    console.log(json);
  }
}

// ============ 测试套件 ============

let testTableId = null;
let testFieldId = null;
let testRecordId = null;

// 测试 1: 列出数据表
async function test1_listTables() {
  const res = await client.bitable.appTable.list({
    path: { app_token: config.appToken },
  });

  if (res.code !== 0) {
    throw new Error(`列出数据表失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   📊 数据表数量: ${res.data.total}`);
  if (res.data.items && res.data.items.length > 0) {
    testTableId = res.data.items[0].table_id;
    console.log(`   📋 第一个表格: ${res.data.items[0].name} (${testTableId})`);
  }

  return res.data;
}

// 测试 2: 列出字段
async function test2_listFields() {
  if (!testTableId) {
    throw new Error('未找到测试表格 ID (test1 失败?)');
  }

  const res = await client.bitable.appTableField.list({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`列出字段失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   📊 字段数量: ${res.data.total}`);
  if (res.data.items && res.data.items.length > 0) {
    console.log(`   📋 字段示例: ${res.data.items[0].field_name} (type: ${res.data.items[0].type})`);
  }

  return res.data;
}

// 测试 3: 创建字段 (文本)
async function test3_createField() {
  if (!testTableId) {
    throw new Error('未找到测试表格 ID');
  }

  const fieldName = `测试字段_${Date.now()}`;

  const res = await client.bitable.appTableField.create({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
    },
    data: {
      field_name: fieldName,
      type: 1, // 文本
    },
  });

  if (res.code !== 0) {
    throw new Error(`创建字段失败: ${res.msg} (code: ${res.code})`);
  }

  testFieldId = res.data.field?.field_id;
  console.log(`   📋 字段名称: ${fieldName}`);
  console.log(`   🆔 字段 ID: ${testFieldId}`);

  return res.data;
}

// 测试 4: 创建单条记录
async function test4_createRecord() {
  if (!testTableId) {
    throw new Error('未找到测试表格 ID');
  }

  const res = await client.bitable.appTableRecord.create({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
    },
    data: {
      fields: {
        [testFieldId || '测试字段']: `测试数据_${Date.now()}`,
      },
    },
  });

  if (res.code !== 0) {
    throw new Error(`创建记录失败: ${res.msg} (code: ${res.code})`);
  }

  testRecordId = res.data.record?.record_id;
  console.log(`   🆔 记录 ID: ${testRecordId}`);

  return res.data;
}

// 测试 5: 查询记录
async function test5_listRecords() {
  if (!testTableId) {
    throw new Error('未找到测试表格 ID');
  }

  const res = await client.bitable.appTableRecord.list({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
    },
    params: {
      page_size: 10,
    },
  });

  if (res.code !== 0) {
    throw new Error(`查询记录失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   📊 记录总数: ${res.data.total}`);
  console.log(`   📋 本页记录: ${res.data.items?.length || 0}`);
  console.log(`   📄 有下一页: ${res.data.has_more ? '是' : '否'}`);

  return res.data;
}

// 测试 6: 搜索记录
async function test6_searchRecords() {
  if (!testTableId) {
    throw new Error('未找到测试表格 ID');
  }

  const res = await client.bitable.appTableRecord.search({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
    },
    data: {
      page_size: 10,
    },
  });

  if (res.code !== 0) {
    throw new Error(`搜索记录失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   📊 搜索结果: ${res.data.items?.length || 0} 条`);

  return res.data;
}

// 测试 7: 批量创建记录
async function test7_batchCreate() {
  if (!testTableId) {
    throw new Error('未找到测试表格 ID');
  }

  const timestamp = Date.now();
  const records = [
    { fields: { [testFieldId || '测试字段']: `批量数据1_${timestamp}` } },
    { fields: { [testFieldId || '测试字段']: `批量数据2_${timestamp}` } },
    { fields: { [testFieldId || '测试字段']: `批量数据3_${timestamp}` } },
  ];

  const res = await client.bitable.appTableRecord.batchCreate({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
    },
    data: {
      records,
    },
  });

  if (res.code !== 0) {
    throw new Error(`批量创建失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   📊 创建成功: ${res.data.records?.length || 0} 条`);

  return res.data;
}

// 测试 8: 更新记录
async function test8_updateRecord() {
  if (!testTableId || !testRecordId) {
    throw new Error('未找到测试记录 ID');
  }

  const res = await client.bitable.appTableRecord.update({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
      record_id: testRecordId,
    },
    data: {
      fields: {
        [testFieldId || '测试字段']: `已更新_${Date.now()}`,
      },
    },
  });

  if (res.code !== 0) {
    throw new Error(`更新记录失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   ✏️ 记录已更新`);

  return res.data;
}

// 测试 9: 删除记录
async function test9_deleteRecord() {
  if (!testTableId || !testRecordId) {
    throw new Error('未找到测试记录 ID');
  }

  const res = await client.bitable.appTableRecord.delete({
    path: {
      app_token: config.appToken,
      table_id: testTableId,
      record_id: testRecordId,
    },
  });

  if (res.code !== 0) {
    throw new Error(`删除记录失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   🗑️ 记录已删除`);

  return res.data;
}

// 测试 10: 创建数据表
async function test10_createTable() {
  const tableName = `测试表格_${Date.now()}`;

  const res = await client.bitable.appTable.create({
    path: { app_token: config.appToken },
    data: {
      table: {
        name: tableName,
      },
    },
  });

  if (res.code !== 0) {
    throw new Error(`创建数据表失败: ${res.msg} (code: ${res.code})`);
  }

  console.log(`   📋 表格名称: ${tableName}`);
  console.log(`   🆔 表格 ID: ${res.data.table_id}`);

  return res.data;
}

// ============ 主测试流程 ============

async function main() {
  console.log('=' .repeat(60));
  console.log('Bitable 工具功能测试');
  console.log('=' .repeat(60));

  // 基础测试
  await runTest('测试 1: 列出数据表', test1_listTables);
  await runTest('测试 2: 列出字段', test2_listFields);
  await runTest('测试 3: 创建字段 (文本)', test3_createField);
  await runTest('测试 4: 创建单条记录', test4_createRecord);
  await runTest('测试 5: 查询记录', test5_listRecords);

  // 高级测试
  await runTest('测试 6: 搜索记录', test6_searchRecords);
  await runTest('测试 7: 批量创建记录', test7_batchCreate);
  await runTest('测试 8: 更新记录', test8_updateRecord);
  await runTest('测试 9: 删除记录', test9_deleteRecord);
  await runTest('测试 10: 创建数据表', test10_createTable);

  // 输出总结
  console.log('\n' + '=' .repeat(60));
  console.log('📊 测试结果总结');
  console.log('=' .repeat(60));
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`⏭️ 跳过: ${testResults.skipped}`);
  console.log(`📊 总计: ${testResults.tests.length}`);

  if (testResults.failed > 0) {
    console.log('\n❌ 失败的测试:');
    testResults.tests
      .filter((t) => t.status === 'failed')
      .forEach((t) => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
  }

  // 保存结果
  const fs = await import('fs');
  const outputPath = './bitable-test-results.json';
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        config: {
          appToken: config.appToken,
          domain: config.domain,
        },
        summary: {
          passed: testResults.passed,
          failed: testResults.failed,
          skipped: testResults.skipped,
          total: testResults.tests.length,
        },
        tests: testResults.tests,
      },
      null,
      2
    )
  );
  console.log(`\n💾 详细结果已保存到: ${outputPath}`);

  if (testResults.failed === 0) {
    console.log('\n✅ 所有测试通过! Bitable 工具功能正常 🎉\n');
  } else {
    console.log('\n⚠️ 有测试失败,请检查错误信息\n');
    process.exit(1);
  }
}

// 运行测试
main().catch((error) => {
  console.error('\n❌ 测试过程中发生错误:', error);
  process.exit(1);
});
