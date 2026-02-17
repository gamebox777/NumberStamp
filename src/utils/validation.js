export const validateProjectName = (name) => {
    if (!name) return { isValid: false, error: 'プロジェクト名を入力してください。' };
    if (name.length > 100) return { isValid: false, error: 'プロジェクト名は100文字以内で入力してください。' };
    if (name !== name.toLowerCase()) return { isValid: false, error: 'プロジェクト名は小文字で入力してください。' };
    // Check for characters other than lowercase letters, digits, '.', '_', '-'
    if (!/^[a-z0-9._-]+$/.test(name)) return { isValid: false, error: '使用できる文字は半角英数字、ドット(.)、アンダースコア(_)、ハイフン(-)のみです。' };
    if (name.includes('---')) return { isValid: false, error: '「---」を含む名前は使用できません。' };

    return { isValid: true, error: null };
};
