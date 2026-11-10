# Health & Fitness Tracker

## Open the app

**[Open Health & Fitness Tracker →](https://health-fitness-journal.daringguppy257.chatgpt.site/)**

This repository contains the source code. Use the link above to open the working application.

The app currently requires sign-in and access permission. Public access to this repository does not automatically grant access to the app.

私人健康日志：React 19、TypeScript、Tailwind 4、Recharts、tRPC 11、Drizzle、Vitest。包含仪表盘、体重、体型示意、运动、睡眠、围度、历史、规划与设置。

## 部署架构

当前可托管版本运行在 Cloudflare Worker + D1，使用 Sites 的私有 ChatGPT 登录。没有 Manus OAuth 凭据，也没有 MySQL 服务，因此本版未使用 Express/MySQL/Manus；部署平台不支持常驻 Express 或 MySQL 原生 TCP。记录通过 tRPC 保存至 D1，所有查询和写入使用服务端登录 ID 隔离。没有将健康记录存于 localStorage。

## 开发

`npm install`、`npm run check`、`npm test`、`npm run db:generate`、`npm run build`。

`npm run dev` 仅提供前端开发；完整接口由生产 Worker 提供，未登录接口返回 401。数据库迁移位于 drizzle/，部署时由 Sites 应用。没有硬编码开发用户或绕过登录。

## 数据结构

`records` 存储经过 Zod 严格校验的 WeightRecord、ExerciseRecord、SleepRecord、MeasurementRecord，带 kind/date/user_id；goals 存储 UserGoal 及嵌套的周计划 PlanningRecord。`users` 预留个人档案，平台身份不依赖该表。记录 ID 与用户 ID 联合作为主键。

体重/睡眠/围度同一天各一条，运动允许同一天多条；重复记录返回冲突提示。数据可新增、编辑、删除；目标、身高、周计划独立保存。示例需用户主动加载，带 demo 标记并可独立清除。JSON 导出完整记录与目标。

## 统计口径

累计平均 = (首条体重 - 最新体重) / ((今天 - 首条记录日期) / 7)。少于两条或经过零天时不生成速率。本周减重 = 周一至今天内首条体重 - 末条体重；少于两条不生成比较。周内实际值不折算为整周。差值容差 ±0.01 kg。负值表示增重，未截断为 0。缺失数据不补零。所有日期按日历日期计算，避免夏令时影响。

睡眠规律性为时长标准差，不推断就寝时间。模型是 BMI 驱动的中性轮廓示意，不预测真实体脂和形状。目标日期为累计速度的线性估算。

## 验证

Vitest 覆盖累计起点、部分周、单条/空数据、增重、零变化、缺失周记录、未来数据过滤和周一分组。前端表单及服务端 Zod 双层校验。在线数据库与浏览器验证情况以交付说明为准。


## Body Studio and visual system

The interface is English throughout, with a light monochrome design, bold system typography and persistent left vertical navigation with a light gray track and black selected items.

Body Studio uses original procedural Three.js geometry. Current and goal avatars are independently editable. Body controls cover height, weight, chest, waist, hips, shoulders, arms, thighs, calves, leg proportions and muscle definition. Face controls modify head size, facial width, jaw, chin, cheeks, eyes, eye spacing, nose and mouth. Surface tones and hair silhouettes are also editable. Drag to rotate both models in place, scroll to zoom, or use accessible Front / Side / Back and zoom controls. Face editing switches to a close-up. Wireframe and measurement overlays are optional.

Both avatar configurations are saved in the authenticated user's goals JSON as optional `bodyModels`, validated by a shared Zod schema. Existing profiles are compatible without migrations. Other goal forms preserve saved model fields. Avatar edits do not rewrite health records or actual goals; copying latest measurements is an explicit action. The models are approximate visualization, not body scans or predictions.

Verification: 19 tests cover the existing calculations and records plus avatar parameter bounds, finite geometry at extremes, actual body/face deformation, independent defaults, saved configurations, validation and user isolation. WebGL browser rendering has not been verified in this environment because the managed browser tool is unavailable.
