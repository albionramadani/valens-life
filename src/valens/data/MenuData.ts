interface MenuItem {
   id: number;
   page: string;
   title: string;
   link: string;
   has_dropdown: boolean;
   sub_menus?: {
      link: string;
      title: string;
   }[];
}[];

const menu_data: MenuItem[] = [

   {
      id: 1,
      page: "header_1",
      has_dropdown: false,
      title: "Ballina",
      link: "/",
   },

   {
      id: 2,
      page: "header_1",
      has_dropdown: false,
      title: "Kategorite",
      link: "/kategorite",
   },
   {
      id: 3,
      page: "header_1",
      has_dropdown: false,
      title: "Rreth nesh",
      link: "/rreth-nesh",
   },
   {
      id: 4,
      page: "header_1",
      has_dropdown: false,
      title: "Produktet",
      link: "/produktet",
   },
   {
      id: 5,
      page: "header_1",
      has_dropdown: false,
      title: "Pyetje",
      link: "/pyetje",
   },
   {
      id: 7,
      page: "header_1",
      has_dropdown: false,
      title: "Kontakti",
      link: "/kontakti",
   },
];
export default menu_data;