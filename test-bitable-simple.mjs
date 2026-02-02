/**
 * Bitable 简化测试脚本
 * 使用表格现有的字段进行测试
 */

import Lark from '@larksuiteoapi/node-sdk';

const config = {
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
  appToken: process.env.FEISHU_TEST_BITABLE_APP_TOKEN,
  domain: process.env.FEISHU_DOMAIN || 'feishu',
};

if (!config.appId || !config.appSecret || !config.appToken) {
  console.error('❌ 错误: 请设置环境变量');
  process.exit(1);
}

const client = new Lark.Client({
  appId: config.appId,
  appSecret: config.appSecret,
  appType: Lark.AppType.SelfBuild,
  domain: config.domain === 'lark' ? Lark.Domain.Lark : Lark.Domain.Feishu,
});

console.log('开始测试...\n');

let tableId, firstFieldId, recordId;

try {
  // 1. 列出数据表
  console.log('1️⃣ 列出数据表...');
  const tables = await client.bitable.appTable.list({
    path: { app_token: config.appToken },
  });
  tableId = tables.data.items[0].table_id;
  console.log(`   ✅ 找到表格: ${tables.data.items[0].name} (${tableId})\n`);

  // 2. 列出字段
  console.log('2️⃣ 列出字段...');
  const fields = await client.bitable.appTableField.list({
    path: { app_token: config.appToken, table_id: tableId },
  });

  // 找到第一个可写入的文本字段（跳过只读类型）
  const writableField = fields.data.items.find((field) => {
    // 字段类型: 1=文本, 2=数字, 3=单选, 4=多选, 7=复选框, 13=电话, 15=URL
    // 跳过: 20=公式, 22=查找引用, 1005=自动编号
    const writableTypes = [1, 2, 3, 4, 7, 13, 15];
    return writableTypes.includes(field.type);
  });

  if (!writableField) {
    throw new Error('未找到可写入的字段，请在表格中添加一个文本字段');
  }

  firstFieldId = writableField.field_id;
  const firstFieldName = writableField.field_name;
  const fieldTypeName = {
    1: '文本', 2: '数字', 3: '单选', 4: '多选',
    7: '复选框', 13: '电话', 15: 'URL'
  }[writableField.type] || `类型${writableField.type}`;

  console.log(`   ✅ 找到可写入字段: ${firstFieldName} (${firstFieldId}, ${fieldTypeName})`);
  console.log(`   调试: 将使用字段名称 "${firstFieldName}" 进行测试\n`);

  // 3. 创建记录（使用字段名称而不是字段ID）
  console.log('3️⃣ 创建记录...');
  const testValue = `测试数据_${Date.now()}`;
  console.log(`   尝试创建记录，字段: "${firstFieldName}", 值: "${testValue}"`);

  const createRes = await client.bitable.appTableRecord.create({
    path: { app_token: config.appToken, table_id: tableId },
    data: {
      fields: {
        [firstFieldName]: testValue,  // 使用字段名称而不是字段ID
      },
    },
  });

  // 调试信息
  console.log('   调试: API 响应码:', createRes.code);
  console.log('   调试: 响应数据:', JSON.stringify(createRes.data, null, 2));

  if (createRes.code !== 0) {
    throw new Error(`API 返回错误: ${createRes.msg} (code: ${createRes.code})`);
  }

  if (!createRes.data || !createRes.data.record) {
    throw new Error(`数据结构异常: ${JSON.stringify(createRes.data)}`);
  }

  recordId = createRes.data.record.record_id;
  console.log(`   ✅ 创建成功: ${recordId}\n`);

  // 4. 查询记录
  console.log('4️⃣ 查询记录...');
  const listRes = await client.bitable.appTableRecord.list({
    path: { app_token: config.appToken, table_id: tableId },
    params: { page_size: 5 },
  });
  console.log(`   ✅ 查询到 ${listRes.data.items.length} 条记录\n`);

  // 5. 更新记录
  console.log('5️⃣ 更新记录...');
  await client.bitable.appTableRecord.update({
    path: { app_token: config.appToken, table_id: tableId, record_id: recordId },
    data: {
      fields: {
        [firstFieldName]: `已更新_${Date.now()}`,  // 使用字段名称
      },
    },
  });
  console.log(`   ✅ 更新成功\n`);

  // 6. 删除记录
  console.log('6️⃣ 删除记录...');
  await client.bitable.appTableRecord.delete({
    path: { app_token: config.appToken, table_id: tableId, record_id: recordId },
  });
  console.log(`   ✅ 删除成功\n`);

  console.log('🎉 所有测试通过！');
  console.log('\nBitable 工具功能完全正常，可以投入使用！✨');

} catch (error) {
  console.error('\n❌ 测试失败:', error.message);
  if (error.response?.data) {
    console.error('详细信息:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
}
