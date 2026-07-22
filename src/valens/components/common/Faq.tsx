"use client"
import { useEffect, useState } from 'react'

interface faqItem {
   id: number;
   question: string;
   answer: React.ReactElement;
   showAnswer: boolean;
}

const faq_data: faqItem[] = [
   {
      id: 1,
      question: " Suxnix ingredients provides a searchable ?",
      answer: (<>There are many variations of passages of lorem ipsum that available but the majority have alteration in some form by injected humour. There are many variations of passages.</>),
      showAnswer: false,
   },
   {
      id: 2,
      question: "How to edit Suxnix themes ?",
      answer: (<>There are many variations of passages of lorem ipsum that available but the majority have alteration in some form by injected humour. There are many variations of passages.</>),
      showAnswer: false,
   },
   {
      id: 3,
      question: "Suxnix app is a powerful application ?",
      answer: (<>There are many variations of passages of lorem ipsum that available but the majority have alteration in some form by injected humour. There are many variations of passages.</>),
      showAnswer: false,
   },
   {
      id: 4,
      question: "Latest version thorough Suxnix powerful ?",
      answer: (<>There are many variations of passages of lorem ipsum that available but the majority have alteration in some form by injected humour. There are many variations of passages.</>),
      showAnswer: false,
   },
   {
      id: 5,
      question: "How to Track My Order ?",
      answer: (<>There are many variations of passages of lorem ipsum that available but the majority have alteration in some form by injected humour. There are many variations of passages.</>),
      showAnswer: false,
   },
];
const FAQ = () => {
   const [faqData, setFaqData] = useState<faqItem[]>([]);

   useEffect(() => {
      const initialFaqData: faqItem[] = faq_data.map((faq, index) => ({
         ...faq,
         showAnswer: index === 0,
      }));
      setFaqData(initialFaqData);
   }, []);

   const toggleAnswer = (index: number) => {
      setFaqData((prevFaqData) => {
         const updatedFaqData = prevFaqData.map((faq, i) => ({
            ...faq,
            showAnswer: i === index ? !faq.showAnswer : false,
         }));
         return updatedFaqData;
      });
   };

   return (
      <div className="accordion" id="accordionExample">
         {faqData.map((item, index) => (
            <div key={item.id} className="accordion-item">
               <h2 className="accordion-header">
                  <button className={`accordion-button ${item.showAnswer ? "" : "collapsed"}`} onClick={() => toggleAnswer(index)} type="button">
                     <span className='count'>{index + 1 > 9 ? index + 1 : `0${index + 1 + "."}`}</span>   {item.question}
                  </button>
               </h2>
               {item.showAnswer && (
                  <div id="collapseOne" className="accordion-collapse collapse show">
                     <div className="accordion-body">
                        <p>{item.answer}</p>
                     </div>
                  </div>
               )}
            </div>
         ))}
      </div>
   )
}

export default FAQ
