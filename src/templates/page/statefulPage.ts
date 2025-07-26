import PageTemplate from "../pageTemplate";

const content = `

import 'package:flutter/material.dart';

class \${pageName} extends StatefulWidget {
  const \${pageName}({super.key});

  @override
  State<\${pageName}> createState() => _\${pageName}State();
}

class _\${pageName}State extends State<\${pageName}> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('\${title}'),
      ),
      body: const Center(
        child: Text(
          '\${title} works!',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
`;

const statefulPage = <PageTemplate>{
  name: "Stateful Page",
  content,
};

export default statefulPage;
