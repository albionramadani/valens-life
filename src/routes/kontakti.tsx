import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import ContactPage from "@v/components/inner-page/contact";

export const Route = createFileRoute("/kontakti")({
  head: () => ({ meta: [{ title: "Kontakti - Valens" }] }),
  component: () => (
    <Wrapper>
      <ContactPage />
    </Wrapper>
  ),
});
