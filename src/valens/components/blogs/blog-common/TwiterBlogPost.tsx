import { Link } from "@tanstack/react-router";

type Datatype = {
   id: number;
   desc: React.ReactElement,
   date: string;
}
const twitter_data: Datatype[] = [
   {
      id: 1,
      desc: (<>Rescue - #Gutenberg ready @ wordpress
         Theme for Creative Bloggers available on
         @ ThemeForest <a href="#">https://t.co/2r1POjOjgV</a> C…
         <a href="#">https://t.co/rDAnPyClu1</a></>),
      date: "November 25, 2023"
   },
   {
      id: 2,
      desc: (<>Rescue - #Gutenberg ready @ wordpress
         Theme for Creative Bloggers available on
         @ ThemeForest <a href="#">https://t.co/2r1POjOjgV</a> C…
         <a href="#">https://t.co/rDAnPyClu1</a></>),
      date: "November 20, 2023"
   },
   {
      id: 3,
      desc: (<>Rescue - #Gutenberg ready @ wordpress
         Theme for Creative Bloggers available on
         @ ThemeForest <a href="#">https://t.co/2r1POjOjgV</a> C…
         <a href="#">https://t.co/rDAnPyClu1</a></>),
      date: "November 15, 2023"
   },
]
const TwiterBlogPost = () => {
   return (
      <div className="widget mb-40">
         <div className="sidebar-title mb-25">
            <h3 className="title">Twitter Feeds</h3>
         </div>
         <div className="twitter-post">
            <ul className="list-wrap">
               {twitter_data.map((item) => (
                  <li key={item.id}>
                     <div className="twitter-icon">
                        <i className="fab fa-twitter"></i>
                     </div>
                     <div className="twitter-content fix">
                        <p>{item.desc}</p>
                        <div className="twitter-post-date">
                           <span>{item.date}</span>
                        </div>
                     </div>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}

export default TwiterBlogPost
