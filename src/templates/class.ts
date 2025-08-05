
export function classTemplate(className: string, classType: string): string {
    switch (classType) {
        case 'Class':
            return `class ${className} {}`;
        case 'Sealed Class':
            return `sealed class ${className} {}`;
        case 'Abstract Class':
            return `abstract class ${className} {}`;
        case 'Interface':
            return `interface ${className} {}`;
        case 'Abstract Interface':
            return `abstract interface class ${className} {}`;
        default:
            return ``;
    }
}
