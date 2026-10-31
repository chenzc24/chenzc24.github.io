'use strict';
window.PortfolioProfile = {
  name: ['陈增春', 'Zengchun Chen'],
  secondaryName: ['Zengchun Chen', '陈增春'],
  greeting: ['你好，', 'Hello,'],
  introduction: ['我是增春。', 'I’m Zengchun.'],
  school: ['清华大学 · 为先书院', 'Tsinghua University · Weixian College'],
  degree: ['集成电路本科生 · 2024—2028（预计）', 'Integrated Circuits · B.Eng. candidate, 2024–2028 (expected)'],
  focus: ['研究 AI4IC，参与模拟电路工具的开源开发。', 'AI4IC research and open-source tools for analog circuit design.'],
  homeIntroduction: ['清华大学集成电路本科生，研究 AI4IC。', 'An integrated circuits undergraduate at Tsinghua, working on AI4IC.'],
  recent: {
    text: ['近况 · 学习、项目与生活', 'Updates · Study, projects & life'],
    href: './updates.html'
  },
  curiosity: ['天文、物理，以及它们背后的数学。', 'Astronomy, physics, and the mathematics behind them.'],
  email: 'chen-zc24@mails.tsinghua.edu.cn',
  github: 'https://github.com/chenzc24',
  // Footer clock. offset is the label shown next to the city.
  place: {city: ['北京', 'Beijing'], timeZone: 'Asia/Shanghai', offset: 'UTC+8'},
  photographs: {
    home: {file:'zengchun-home.jpg', width:1279, height:1706},
    profile: {file:'zengchun-profile.jpg', width:544, height:772}
  },
  experience: [
    {year:'2026', items:[
      {title:['华大九天 PyAether 生态活动','Empyrean PyAether ecosystem program'], detail:['卓越成果奖','Outstanding Achievement Award']},
      {title:['NUS 暑期研习','NUS Summer Workshop'], detail:['Deep Learning 课程 A+；PokerMate 团队项目二等奖','A+ in Deep Learning; Second Prize for the PokerMate team project']}
    ]},
    {year:'2025', items:[
      {title:['第十七届全国大学生数学竞赛','17th National Undergraduate Mathematics Competition'], detail:['非数学 A 类一等奖','First Prize, non-mathematics Category A']},
      {title:['清华大学奖学金','Tsinghua University scholarship'], detail:['学业优秀奖学金','Academic Excellence Scholarship']},
      {title:['工程实习与社会实践','Engineering internship & field research'], detail:['珠海芯片企业工程实习；上海“新质生产力”社会实践','Engineering internship at Lingyange Chip Technology, Zhuhai; social-practice research in Shanghai']}
    ]}
  ]
};
