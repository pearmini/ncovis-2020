import p1 from "../../assets/images/article/1.png";
import p2 from "../../assets/images/article/2.png";
import p3 from "../../assets/images/article/3.png";
import p4 from "../../assets/images/article/4.png";
import p5 from "../../assets/images/article/5.png";
import p6 from "../../assets/images/article/6.png";

export const get = () => [
  {
    id: 1,
    title: "疫情期间，有哪些和网课相关的有趣话题？",
    url: "https://zhuanlan.zhihu.com/p/129089330",
    des:
      "通过山东大学VisLab的疫情可视化工具中的动态条形图，我发现了一些与网课有关的有趣话题，综合时间线分析话题的产生原因和印象。",
    createTime: new Date("2020-04-12"),
    author: "wxw",
    imageUrl: p1,
  },
  {
    id: 2,
    title: "nCoVIS: 一个新冠疫情可视化分析平台",
    url:
      "https://medium.com/@zcy201420752/ncovis-visualization-platform-for-covid-19-d3f255d5ce79",
    des:
      "本篇博客旨在使用nCoVIS提供的种种功能对疫情的期间的文本和数值数据作出分析，并对于分析结果给出我一些见解。",
    createTime: new Date("2020-04-12"),
    author: "Chuyang",
    imageUrl: p2,
  },
  {
    id: 3,
    title: "疫情期间福建省舆论变化",
    url: "https://www.jianshu.com/p/27b71bfa92c2",
    des: "分析1月底至4月初，福建省新闻报道关键词的变化情况。",
    createTime: new Date("2020-04-12"),
    author: "N7wings",
    imageUrl: p3,
  },
  {
    id: 4,
    title: "分析疫情期间有哪些热度特别高的超级话题",
    url:
      "https://www.yuque.com/docs/share/22dbc894-176e-40c1-b44d-f8032b094d6e?#",
    des:
      "具有突发性、小概率事件，对多数用户而言是非常有吸引力的一些话题，无论是什么时间，这样的新闻也会是热点。",
    createTime: new Date("2020-04-12"),
    author: "yjq",
    imageUrl: p4,
  },
  {
    id: 5,
    title: "疫情新闻舆论数据可视化工具的使用",
    url: "https://blog.csdn.net/weixin_43913977/article/details/105428347",
    des: "这里分析了从疫情爆发到现在新闻热搜变化的趋势和其中的原因。",
    createTime: new Date("2020-04-12"),
    author: "一只南极的熊",
    imageUrl: p5,
  },
  {
    id: 6,
    title: "英国抗疫",
    url: "https://www.lofter.com/lpost/1f439172_1c999146b",
    des: "英国停止对轻症患者进行检测，公共卫生官员未能制定大规模检测计划。",
    createTime: new Date("2020-04-12"),
    author: "Higgins011",
    imageUrl: p6,
  },
];
