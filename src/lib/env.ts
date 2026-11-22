export const env = {
  notion: () => Boolean(process.env.NOTION_API_KEY),
  notionLearning: () =>
    Boolean(
      process.env.NOTION_API_KEY &&
      process.env.NOTION_CATEGORY_DB_ID &&
      process.env.NOTION_STUDY_TIME_DB_ID,
    ),
  notionTasks: () =>
    Boolean(
      process.env.NOTION_API_KEY &&
      process.env.NOTION_PARENT_TASK_DB_ID &&
      process.env.NOTION_CHILD_TASK_DB_ID,
    ),
  microcms: () =>
    Boolean(
      process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_API_KEY,
    ),
  github: () => Boolean(process.env.GITHUB_USERNAME),
};
