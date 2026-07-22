type StaticImageData = any;

const blogImg_1 = "/assets/img/blog/post_thumb01.jpg";
const blogImg_2 = "/assets/img/blog/post_thumb02.jpg";
const blogImg_3 = "/assets/img/blog/post_thumb03.jpg";
const blogImg_2_1 = "/assets/img/blog/blog_post_thumb01.jpg";
const blogImg_2_2 = "/assets/img/blog/blog_post_thumb02.jpg";
const blogImg_2_3 = "/assets/img/blog/blog_post_thumb03.jpg";
const blogImg_3_1 = "/assets/img/blog/inner_blog_thumb01.jpg";
const blogImg_3_2 = "/assets/img/blog/inner_blog_thumb02.jpg";
const blogImg_3_3 = "/assets/img/blog/inner_blog_thumb03.jpg";
const blogAvatar_1 = "/assets/img/blog/b_avatar.png";
const blogQuote = "/assets/img/icons/blockquote.png";
interface DataType {
   id: number;
   page:string;
   img?: string | any
   tag?: string;
   date: string;
   title: string;
   comment: number;
   view: number;
   desc?:string;
   avatar?:string;
   avatar_name?:string;
   video?:boolean;
   slider?:string[];
   class_name?:string;
   ratio?:boolean;
   quote?:string;
   blog_bg?:string;
}

const blog_data: DataType[] = [
   {
      id: 1,
      page:"home_1",
      img: blogImg_1,
      tag: "Tips & Tricks",
      date: "12 Days ago",
      title: "hOW MUCH DO EAT YOU REALLY NEED...",
      comment: 24,
      view: 77
   },
   {
      id: 2,
      page:"home_1",
      img: blogImg_2,
      tag: "Tips & Tricks",
      date: "15 Days ago",
      title: "Supplementing your diet tOWARDS ...",
      comment: 29,
      view: 87
   },
   {
      id: 3,
      page:"home_1",
      img: blogImg_3,
      tag: "Tips & Tricks",
      date: "15 Days ago",
      title: "Dietary Supplement report market...",
      comment: 29,
      view: 87
   },

   // home 2
   
   {
      id: 1,
      page:"home_2",
      img: blogImg_2_1,
      tag: "Foods",
      date: "24th September 2023",
      title: "Lorem ipsum dolor consectetur sit amet adipisicing",
      comment: 29,
      view: 87,
   },
   {
      id: 2,
      page:"home_2",
      img: blogImg_2_2,
      tag: "Gym",
      date: "29th September 2023",
      title: "Best ways to support your healthy immune system",
      comment: 29,
      view: 87,
   },
   {
      id: 3,
      page:"home_2",
      img: blogImg_2_3,
      tag: "Fitness",
      date: "30th September 2023",
      title: "Organic food is produced methods complying",
      comment: 29,
      view: 87,
   },

   // for blog
   {
      id: 1,
      page:"blog",
      img: blogImg_3_1,
      tag: "Business",
      date: "29th July 2023",
      title: "Lorem ipsum dolor sit amet consecte cing elit sed do eiusmod tempor.",
      comment: 35,
      view: 232,
      avatar:blogAvatar_1,
      avatar_name:"Savannah",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
   },
   {
      id: 2,
      page:"blog",
      img: blogImg_3_2,
      tag: "Business",
      date: "24th July 2023",
      title: "Adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore.",
      comment: 25,
      view: 159,
      avatar:blogAvatar_1,
      avatar_name:"Mackenzie",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      video:true,
      class_name:"position-relative",
   },
   {
      id: 3,
      page:"blog",
      slider: [blogImg_3_3,blogImg_3_1,blogImg_3_2],
      tag: "Business",
      date: "19th July 2023",
      title: "Magna aliqua Ut enim ad minim venia mola quis nostrud exercitation ullamco",
      comment: 51,
      view: 800,
      avatar:blogAvatar_1,
      avatar_name:"Autumn",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
   },
   {
      id: 4,
      page:"blog",
      tag: "Business",
      date: "29th July 2023",
      title: "Laboris nisi ut aliquip ex ea commodo consequat, Duis aute irure dolor.",
      comment: 60,
      view: 200,
      avatar:blogAvatar_1,
      avatar_name:"Valentina",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      ratio:true,
   },
   {
      id: 5,
      page:"blog",
      tag: "Business",
      date: "10th July 2023",
      title: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      comment: 30,
      view: 232,
      avatar:blogAvatar_1,
      avatar_name:"Valentina",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
   },
   {
      id: 6,
      page:"blog",
      date: "05th July 2023",
      title: "Excepteur sint occaecat cupida tat non proident sunt in.",
      comment: 35,
      view: 242,
      quote:blogQuote,
      blog_bg:"/assets/img/blog/bsingle_post_bg.jpg",
   },
   {
      id: 7,
      page:"blog",
      tag: "Business",
      date: "01th July 2023",
      title: "Culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis",
      comment: 39,
      view: 252,
      blog_bg:"/assets/img/blog/bsingle_post_bg02.jpg",
   },
   {
      id: 8,
      page:"blog",
      slider: [blogImg_3_3,blogImg_3_1,blogImg_3_2],
      tag: "Business",
      date: "19th July 2023",
      title: "Magna aliqua Ut enim ad minim venia mola quis nostrud exercitation ullamco",
      comment: 51,
      view: 800,
      avatar:blogAvatar_1,
      avatar_name:"Autumn",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
   },
   {
      id: 9,
      page:"blog",
      tag: "Business",
      date: "29th July 2023",
      title: "Laboris nisi ut aliquip ex ea commodo consequat, Duis aute irure dolor.",
      comment: 60,
      view: 200,
      avatar:blogAvatar_1,
      avatar_name:"Valentina",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      ratio:true,
   },
   {
      id: 10,
      page:"blog",
      img: blogImg_3_1,
      tag: "Business",
      date: "29th July 2023",
      title: "Lorem ipsum dolor sit amet consecte cing elit sed do eiusmod tempor.",
      comment: 35,
      view: 232,
      avatar:blogAvatar_1,
      avatar_name:"Savannah",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
   },
   {
      id: 11,
      page:"blog",
      img: blogImg_3_2,
      tag: "Business",
      date: "24th July 2023",
      title: "Adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore.",
      comment: 25,
      view: 159,
      avatar:blogAvatar_1,
      avatar_name:"Mackenzie",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      video:true,
      class_name:"position-relative",
   },
   {
      id: 12,
      page:"blog",
      tag: "Business",
      date: "10th July 2023",
      title: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      comment: 30,
      view: 232,
      avatar:blogAvatar_1,
      avatar_name:"Valentina",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
   },
   {
      id: 13,
      page:"blog",
      date: "05th July 2023",
      title: "Excepteur sint occaecat cupida tat non proident sunt in.",
      comment: 35,
      view: 242,
      quote:blogQuote,
      blog_bg:"/assets/img/blog/bsingle_post_bg.jpg",
   },
   {
      id: 14,
      page:"blog",
      tag: "Business",
      date: "01th July 2023",
      title: "Culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis",
      comment: 39,
      view: 252,
      blog_bg:"/assets/img/blog/bsingle_post_bg02.jpg",
   },
   {
      id: 15,
      page:"blog",
      img: blogImg_3_2,
      tag: "Business",
      date: "24th July 2023",
      title: "Adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore.",
      comment: 25,
      view: 159,
      avatar:blogAvatar_1,
      avatar_name:"Mackenzie",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      video:true,
      class_name:"position-relative",
   },
   {
      id: 16,
      page:"blog",
      img: blogImg_3_2,
      tag: "Business",
      date: "24th July 2023",
      title: "Adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore.",
      comment: 25,
      view: 159,
      avatar:blogAvatar_1,
      avatar_name:"Mackenzie",
      desc:"Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
      video:true,
      class_name:"position-relative",
   },
   {
      id: 17,
      page:"blog",
      tag: "Business",
      date: "01th July 2023",
      title: "Culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis",
      comment: 39,
      view: 252,
      blog_bg:"/assets/img/blog/bsingle_post_bg02.jpg",
   },
]

export default blog_data;