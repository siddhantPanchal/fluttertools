import PageTemplate from "../pageTemplate";

const content = `

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

class \${pageName}  extends HookWidget{
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

const statelessHookPage = <PageTemplate>{
  name: "Stateless Hook Page",
  content,
};

export default statelessHookPage;
