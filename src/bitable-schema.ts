import { Type, type Static } from "@sinclair/typebox";

/**
 * Feishu Bitable (多维表格) Tool Schema
 *
 * 支持的操作:
 * 1. list_tables - 列出数据表
 * 2. create_table - 创建数据表
 * 3. list_fields - 列出字段
 * 4. create_field - 创建字段
 * 5. list_records - 分页查询记录
 * 6. search_records - 搜索记录
 * 7. create_record - 创建单条记录
 * 8. batch_create_records - 批量创建记录
 * 9. update_record - 更新记录
 * 10. delete_record - 删除记录
 */

export const FeishuBitableSchema = Type.Union([
  // 1. 列出数据表
  Type.Object({
    action: Type.Literal("list_tables"),
    app_token: Type.String({
      description: "多维表格 app_token (从 URL /base/XXX 提取)",
    }),
  }),

  // 2. 创建数据表
  Type.Object({
    action: Type.Literal("create_table"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_name: Type.String({ description: "表格名称" }),
  }),

  // 3. 列出字段
  Type.Object({
    action: Type.Literal("list_fields"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
  }),

  // 4. 创建字段
  Type.Object({
    action: Type.Literal("create_field"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
    field_name: Type.String({ description: "字段名称" }),
    field_type: Type.Union([
      Type.Literal(1), // 文本
      Type.Literal(2), // 数字
      Type.Literal(3), // 单选
      Type.Literal(4), // 多选
      Type.Literal(5), // 日期
      Type.Literal(7), // 复选框
      Type.Literal(11), // 人员
      Type.Literal(13), // 电话号码
      Type.Literal(15), // 超链接
      Type.Literal(17), // 附件
    ], {
      description: "字段类型: 1-文本, 2-数字, 3-单选, 4-多选, 5-日期, 7-复选框, 11-人员, 13-电话, 15-超链接, 17-附件",
    }),
    field_properties: Type.Optional(
      Type.String({
        description: "字段属性 JSON 字符串 (例如单选选项: {\"options\":[{\"name\":\"选项1\"}]})",
      })
    ),
  }),

  // 5. 分页查询记录
  Type.Object({
    action: Type.Literal("list_records"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
    page_size: Type.Optional(Type.Number({ description: "每页记录数 (默认 100, 最大 500)" })),
    page_token: Type.Optional(Type.String({ description: "分页标记 (用于获取下一页)" })),
  }),

  // 6. 搜索记录
  Type.Object({
    action: Type.Literal("search_records"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
    filter: Type.Optional(
      Type.String({
        description: "过滤条件 JSON 字符串 (例如: {\"conjunction\":\"and\",\"conditions\":[{\"field_name\":\"字段1\",\"operator\":\"is\",\"value\":\"值\"}]})",
      })
    ),
    sort: Type.Optional(
      Type.String({
        description: "排序规则 JSON 字符串 (例如: [{\"field_name\":\"字段1\",\"desc\":false}])",
      })
    ),
    page_size: Type.Optional(Type.Number({ description: "每页记录数 (默认 100, 最大 500)" })),
  }),

  // 7. 创建单条记录
  Type.Object({
    action: Type.Literal("create_record"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
    fields: Type.String({
      description: "记录字段 JSON 字符串 (例如: {\"字段1\":\"值1\",\"字段2\":123})",
    }),
  }),

  // 8. 批量创建记录
  Type.Object({
    action: Type.Literal("batch_create_records"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
    records: Type.String({
      description: "记录列表 JSON 字符串 (例如: [{\"fields\":{\"字段1\":\"值1\"}},{\"fields\":{\"字段1\":\"值2\"}}]), 最多 500 条",
    }),
  }),

  // 9. 更新记录
  Type.Object({
    action: Type.Literal("update_record"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
    record_id: Type.String({ description: "记录 ID" }),
    fields: Type.String({
      description: "要更新的字段 JSON 字符串 (例如: {\"字段1\":\"新值\"})",
    }),
  }),

  // 10. 删除记录
  Type.Object({
    action: Type.Literal("delete_record"),
    app_token: Type.String({ description: "多维表格 app_token" }),
    table_id: Type.String({ description: "数据表 ID" }),
    record_id: Type.String({ description: "记录 ID" }),
  }),
]);

export type FeishuBitableParams = Static<typeof FeishuBitableSchema>;
