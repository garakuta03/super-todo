// 入力検証の定数
export const VALIDATION_LIMITS = {
  TASK_TITLE_MAX_LENGTH: 255,
  TASK_DESCRIPTION_MAX_LENGTH: 5000,
  LIST_NAME_MAX_LENGTH: 100,
  PROJECT_NAME_MAX_LENGTH: 100,
  WORKSPACE_NAME_MAX_LENGTH: 100,
  USER_DISPLAY_NAME_MAX_LENGTH: 50,
} as const

// タスクタイトルの検証
export const validateTaskTitle = (title: string): { valid: boolean; error?: string } => {
  const trimmed = title.trim()

  if (!trimmed) {
    return { valid: false, error: 'タスク名を入力してください' }
  }

  if (trimmed.length > VALIDATION_LIMITS.TASK_TITLE_MAX_LENGTH) {
    return {
      valid: false,
      error: `タスク名は${VALIDATION_LIMITS.TASK_TITLE_MAX_LENGTH}文字以内で入力してください`
    }
  }

  return { valid: true }
}

// タスク説明文の検証
export const validateTaskDescription = (description?: string): { valid: boolean; error?: string } => {
  if (!description) {
    return { valid: true }
  }

  if (description.length > VALIDATION_LIMITS.TASK_DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      error: `説明は${VALIDATION_LIMITS.TASK_DESCRIPTION_MAX_LENGTH}文字以内で入力してください`
    }
  }

  return { valid: true }
}

// リスト名の検証
export const validateListName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: 'リスト名を入力してください' }
  }

  if (trimmed.length > VALIDATION_LIMITS.LIST_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `リスト名は${VALIDATION_LIMITS.LIST_NAME_MAX_LENGTH}文字以内で入力してください`
    }
  }

  return { valid: true }
}

// プロジェクト名の検証
export const validateProjectName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: 'プロジェクト名を入力してください' }
  }

  if (trimmed.length > VALIDATION_LIMITS.PROJECT_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `プロジェクト名は${VALIDATION_LIMITS.PROJECT_NAME_MAX_LENGTH}文字以内で入力してください`
    }
  }

  return { valid: true }
}

// ワークスペース名の検証
export const validateWorkspaceName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: 'ワークスペース名を入力してください' }
  }

  if (trimmed.length > VALIDATION_LIMITS.WORKSPACE_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `ワークスペース名は${VALIDATION_LIMITS.WORKSPACE_NAME_MAX_LENGTH}文字以内で入力してください`
    }
  }

  return { valid: true }
}

// ユーザー表示名の検証
export const validateDisplayName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: '表示名を入力してください' }
  }

  if (trimmed.length > VALIDATION_LIMITS.USER_DISPLAY_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `表示名は${VALIDATION_LIMITS.USER_DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください`
    }
  }

  return { valid: true }
}

// タスク全体の検証
export const validateTask = (title: string, description?: string): { valid: boolean; error?: string } => {
  const titleValidation = validateTaskTitle(title)
  if (!titleValidation.valid) {
    return titleValidation
  }

  const descriptionValidation = validateTaskDescription(description)
  if (!descriptionValidation.valid) {
    return descriptionValidation
  }

  return { valid: true }
}
