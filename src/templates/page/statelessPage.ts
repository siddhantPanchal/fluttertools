import PageTemplate from "../pageTemplate";

const content = `

import 'package:flutter/material.dart';

class \${pageName} extends StatelessWidget {
  const \${pageName}({super.key});

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

const statelessPage = <PageTemplate>{
  name: "Stateless Page",
  content,
};

export default statelessPage;
