type StaticImageData = any;

const testiAvatar_1 = "/assets/img/others/testi_avatar01.jpg";
const testiAvatar_2 = "/assets/img/others/testi_avatar02.jpg";
const testiAvatar_3 = "/assets/img/others/testi_avatar03.jpg";
const testiAvatar_2_1 = "/assets/img/others/testi_img01.jpg";
const testiAvatar_2_2 = "/assets/img/others/testi_img02.jpg";
interface DataType {
   id: number;
   page:string;
   rating: string[];
   desc: string;
   avatar: string;
   avatar_name: string;
   title?:string;
}
const testi_data: DataType[] = [
   {
      id: 1,
      page:"home_1",
      rating: ["fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star-half-alt"],
      desc: "“Becoming more involved in administration within the (MidMichigan) health system over the years, I had been researching options for further education that would assist in this transition and fit my busy schedule",
      avatar: testiAvatar_1,
      avatar_name: "Janeta Cooper"
   },
   {
      id: 2,
      page:"home_1",
      rating: ["fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star-half-alt"],
      desc: "“Becoming more involved in administration within the (MidMichigan) health system over the years, I had been researching options for further education that would assist in this transition and fit my busy schedule",
      avatar: testiAvatar_2,
      avatar_name: "Lempor Kooper"
   },
   {
      id: 3,
      page:"home_1",
      rating: ["fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star-half-alt"],
      desc: "“Becoming more involved in administration within the (MidMichigan) health system over the years, I had been researching options for further education that would assist in this transition and fit my busy schedule",
      avatar: testiAvatar_3,
      avatar_name: "Zonalos Neko"
   },

   // for home two
   {
      id: 1,
      page:"home_2",
      rating: ["fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star",],
     title:"I Use it Everyday",
      desc: "Reference about Lorem Ipsums giving information origins",
      avatar: testiAvatar_2_1,
      avatar_name: "Zonalos Neko"
   },
   {
      id: 2,
      page:"home_2",
      rating: ["fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star",],
     title:"100% Organic Products",
      desc: "Reference about Lorem Ipsums giving information origins",
      avatar: testiAvatar_2_2,
      avatar_name: "Dr.Jon Smith ."
   },
   {
      id: 3,
      page:"home_2",
      rating: ["fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star",],
     title:"100% Organic Products",
      desc: "Reference about Lorem Ipsums giving information origins",
      avatar: testiAvatar_2_2,
      avatar_name: "Zonalos Neko"
   },
   {
      id: 4,
      page:"home_2",
      rating: ["fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star", "fas fa-star",],
     title:"I Use it Everyday",
      desc: "Reference about Lorem Ipsums giving information origins",
      avatar: testiAvatar_2_1,
      avatar_name: "Dr.Jon Smith ."
   },
]

export default testi_data;