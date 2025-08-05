
interface ClassField {
    name: string;
    type: string;
}

export function modelClassTemplate(className: string, fields: ClassField[]): string {
    const constructorParams = fields.map(f => `this.${f.name}`).join(', ');
    const fieldDeclarations = fields.map(f => `  final ${f.type} ${f.name};`).join('\n');
    const copyWithParams = fields.map(f => `${f.type}? ${f.name}`).join(', ');
    const copyWithBody = fields.map(f => `${f.name}: ${f.name} ?? this.${f.name}`).join(',\n      ');

    return `
class ${className} {
${fieldDeclarations}

  ${className}({
    ${constructorParams}
  });

  ${className} copyWith({
    ${copyWithParams}
  }) {
    return ${className}(
      ${copyWithBody}
    );
  }
}
`;
}
