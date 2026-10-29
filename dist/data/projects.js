'use strict';
// Original project assets only. Provenance is also recorded in assets/SOURCES.txt.
window.PortfolioProjects = [
  {
    id: 'io-ring', name: 'I/O Ring',
    role: ['共同第一作者 · IEEE ISCAS 2026', 'Co-first author · IEEE ISCAS 2026'],
    summary: ['多模态智能体驱动的多工艺 I/O Ring 生成。', 'Multimodal agents for I/O ring generation across process nodes.'],
    introduction: ['将自然语言和视觉输入转化为 I/O Ring 原理图与版图，支持 28nm、180nm 工艺及 DRC/LVS 验证。研究成果发表于 IEEE ISCAS 2026。', 'An agent that turns language and visual input into I/O ring schematics and layouts, with support for 28nm and 180nm processes and DRC/LVS verification. Published at IEEE ISCAS 2026.'],
    image: 'io-ring-layout.png', imageWidth: 719, imageHeight: 526,
    imageAlt: ['AMS-IO-Bench 的 28nm 混合信号 I/O Ring 原始版图截图', 'Original 28nm mixed-signal I/O ring layout screenshot from AMS-IO-Bench'],
    imageDescription: ['AMS-IO-Bench 仓库中的 28nm 混合信号测试案例原图。', 'Original layout screenshot from the 28nm mixed-signal benchmark case in AMS-IO-Bench.'],
    source: 'https://github.com/Arcadia-1/AMS-IO-Agent/blob/046a2e3edccd76322ab3e47c4dd9a5a1eded1e8a/AMS-IO-Bench/28nm_wirebonding/golden_output/IO_28nm_3x3_single_ring_mixed/layout_screenshot.png',
    links: [
      {label: ['论文', 'Paper'], url: 'https://doi.org/10.1109/ISCAS66217.2026.11562717'},
      {label: ['GitHub', 'GitHub'], url: 'https://github.com/chenzc24/t28-ioring'}
    ]
  },
  {
    id: 'analog-canvas', name: 'Analog Canvas', role: ['核心开发者', 'Core developer'],
    summary: ['模拟电路原理图画板。', 'A schematic canvas for analog circuits.'],
    introduction: ['面向模拟电路的原理图编辑器，支持层次化设计、SPICE 导入与网表导出。', 'A schematic editor for analog circuits, with hierarchical design, SPICE import, and netlist export.'],
    image: 'folded-cascode-op-amp-pmos-cascode-loads.svg', imageWidth: 461, imageHeight: 333,
    imageAlt: ['Analog Canvas 导出的折叠共源共栅运算放大器（PMOS 共源共栅负载）', 'Analog Canvas export: folded-cascode op amp with PMOS cascode loads'],
    imageDescription: ['Analog Canvas 导出原图，未经重绘。', 'Original, unmodified Analog Canvas SVG export.'],
    source: './assets/folded-cascode-op-amp-pmos-cascode-loads.svg',
    links: [
      {label: ['打开画板', 'Open editor'], url: 'https://analog-canvas.tokenzhang.com/editor'},
      {label: ['GitHub', 'GitHub'], url: 'https://github.com/cascode-ai/analog-canvas'}
    ]
  },
  {
    id: 'adc-toolbox', name: 'ADCtoolbox', role: ['主要维护者', 'Major maintainer'],
    summary: ['ADC 性能分析、建模与校准。', 'ADC analysis, modeling, and calibration.'],
    introduction: ['用于 ADC 建模、频谱分析和校准的工具库。我也曾参与基于 LLM 的 ADC 诊断助手 SRT 项目。', 'A toolkit for ADC modeling, spectrum analysis, and calibration. I also took part in an SRT project on an LLM-based ADC diagnostic assistant.'],
    image: 'adc-spectrum.png', imageWidth: 1200, imageHeight: 900,
    imageAlt: ['ADCtoolbox 快速入门中的功率谱示例原图', 'Original power spectrum example from the ADCtoolbox quickstart'],
    imageDescription: ['ADCtoolbox 快速入门示例的频谱图。', 'Power spectrum example from the ADCtoolbox quickstart.'],
    source: 'https://github.com/Arcadia-1/ADCToolbox/blob/8d62fb1863e38ffe5c6cc3ac48fa9c24d9df1ae9/docs/images/quickstart_spectrum.png',
    license: 'adctoolbox-LICENSE.txt',
    links: [{label: ['GitHub', 'GitHub'], url: 'https://github.com/Arcadia-1/ADCToolbox'}]
  },
  {
    id: 'virtuoso-bridge', name: 'virtuoso-bridge-lite', role: ['主要维护者', 'Major maintainer'],
    summary: ['连接 AI Agent 与 Cadence Virtuoso。', 'Connecting AI agents with Cadence Virtuoso.'],
    introduction: ['通过 Python、SKILL 和命令行连接 Cadence Virtuoso 与 Spectre，支持本地和远程 EDA 工作流。', 'Connects to Cadence Virtuoso and Spectre through Python, SKILL, and the command line, supporting local and remote EDA workflows.'],
    image: 'virtuoso-architecture.png', imageWidth: 1800, imageHeight: 756,
    imageAlt: ['virtuoso-bridge-lite 官方架构图', 'Official virtuoso-bridge-lite architecture diagram'],
    imageDescription: ['virtuoso-bridge-lite 官方文档架构图，未经重绘。', 'Original, unmodified architecture diagram from the virtuoso-bridge-lite documentation.'],
    source: 'https://github.com/Arcadia-1/virtuoso-bridge-lite/blob/17883ca35d14df108f46ebeb5c2ea9d70ee08acf/docs/assets/arch.png',
    license: 'virtuoso-bridge-LICENSE.txt',
    links: [
      {label: ['文档', 'Documentation'], url: 'https://virtuoso-bridge.tokenzhang.com/guide/'},
      {label: ['GitHub', 'GitHub'], url: 'https://github.com/Arcadia-1/virtuoso-bridge-lite'}
    ]
  }
];
