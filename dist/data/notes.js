'use strict';
// Short editorial drafts grounded in the linked material; no invented personal history.
window.PortfolioNotes = [
  {
    id: 'mobius-seam',
    title: ['莫比乌斯带的接缝', 'The seam of a Möbius strip'],
    paragraphs: [
      ['把纸带的一端转半圈再接上，就得到莫比乌斯带。沿着纸带连续走，能到达原本看似“另一面”的位置。', 'Give one end of a paper strip a half-turn, then join the ends. Following the resulting Möbius strip takes you to what initially looked like its other side.'],
      ['在参数化绘图中，接缝两端要反向配对：沿带方向走完一圈，横向坐标 v 变成 −v。一条线的终点，要接到对应的镜像线上。', 'A parametric drawing needs the same reversed pairing at the seam. After one turn around the strip, the transverse coordinate v becomes −v. Each line must meet its mirrored counterpart.']
    ],
    equation: 'r(0, v) = r(2π, −v)',
    reference: {label:['拓扑参考 · OpenLearn','Topology reference · OpenLearn'],url:'https://www.open.edu/openlearn/science-maths-technology/mathematics-statistics/surfaces/content-section-2.3.2'}
  },
  {
    id: 'spectrum-noise',
    title: ['频谱里，什么算噪声？', 'What counts as noise?'],
    paragraphs: [
      ['加窗后的谐波会在频谱上占据一段频带。计算排除谐波的 SNR 时，只去掉峰值那个频点，会把附近的谐波能量留在噪声项里。', 'Windowing spreads a harmonic over several frequency bins. When computing SNR with harmonics excluded, removing only the peak bin leaves nearby harmonic energy in the noise term.'],
      ['这次 ADCtoolbox 的修改把谐波频带纳入掩码，并在分析带宽边缘裁切。比较 SNR、THD 之前，需要先说清积分的范围，以及哪些频点计入了哪一项。', 'The ADCtoolbox change masks harmonic lobes and clips them at the analysis-band edges. Comparing SNR or THD starts with agreeing on the integration band and which bins belong to each power term.'],
      ['如果杂散落进谐波频带，掩码也可能把它一起排除；还要结合 SNDR、SFDR 和原始频谱判断。', 'A spur inside a harmonic lobe can also be excluded by that mask. SNDR, SFDR, and the original spectrum help interpret such cases.']
    ],
    reference: {label:['相关修改 · ADCtoolbox','Related change · ADCtoolbox'],url:'https://github.com/Arcadia-1/ADCToolbox/pull/71'}
  }
];
