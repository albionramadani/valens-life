
import { useEffect, useState } from "react";

interface FaqItem {
  id: number;
  question: string;
  answer: React.ReactElement;
  showAnswer: boolean;
}

const faqDataStatic: FaqItem[] = [
  {
    id: 1,
    question: "A janë produktet origjinale?",
    answer: (
      <>
        Po, të gjitha produktet janë origjinale dhe vijnë nga brandi Life
        Extension.
      </>
    ),
    showAnswer: false,
  },
  {
    id: 2,
    question: "Nga vijnë produktet?",
    answer: (
      <>
        Të gjitha produktet janë të prodhuara në SHBA dhe vijnë përmes Europës,
        duke ruajtur standardet e larta që i karakterizojnë.
      </>
    ),
    showAnswer: false,
  },
  {
    id: 3,
    question: "Si mund të zgjedh produktin e duhur?",
    answer: (
      <>
        Mund të zgjedhësh sipas kategorive (Zemra, Imuniteti, etj) ose të na
        kontaktosh për ndihmë.
      </>
    ),
    showAnswer: false,
  },
  {
    id: 4,
    question: "A mund të përdoren produktet së bashku?",
    answer: (
      <>
        Po, shumë prej produkteve mund të kombinohen, në varësi të nevojave të
        tua.
      </>
    ),
    showAnswer: false,
  },
  {
    id: 5,
    question: "Si bëhet porosia?",
    answer: (
      <>
        Mund të porosisësh direkt në website ose përmes kontaktit në Instagram.
      </>
    ),
    showAnswer: false,
  },
];

const HomeOneFaq = () => {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    const initial = faqDataStatic.map((faq, index) => ({
      ...faq,
      showAnswer: index === 0,
    }));
    setFaqItems(initial);
  }, []);

  const toggleAnswer = (index: number) => {
    setFaqItems((prev) =>
      prev.map((item, i) => ({
        ...item,
        showAnswer: i === index ? !item.showAnswer : false,
      }))
    );
  };

  return (
    <section id="faq" className="valens-faq-area">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7">
            <div className="section-title text-center mb-40">
              <h2 className="title">Pyetje të shpeshta</h2>
              <p className="valens-faq-subtitle">
                Gjithçka që duhet të dish para se të zgjedhësh produktin e
                duhur.
              </p>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-9">
            <div className="accordion" id="valensFaqAccordion">
              {faqItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`accordion-item ${item.showAnswer ? "is-open" : ""}`}
                >
                  <h2 className="accordion-header">
                    <button
                      type="button"
                      onClick={() => toggleAnswer(index)}
                      aria-expanded={item.showAnswer}
                      aria-controls={`valensFaqCollapse-${item.id}`}
                      className={`accordion-button ${{
                        true: "",
                        false: "collapsed",
                      }[String(item.showAnswer) as "true" | "false"]}`}
                    >
                      <span className="faq-question">{item.question}</span>
                      <span className="faq-toggle" aria-hidden="true">
                        {item.showAnswer ? "×" : "+"}
                      </span>
                    </button>
                  </h2>
                  {item.showAnswer && (
                    <div
                      id={`valensFaqCollapse-${item.id}`}
                      className="accordion-collapse collapse show"
                    >
                      <div className="accordion-body">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeOneFaq;
