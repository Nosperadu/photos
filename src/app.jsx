import React from "react";
import { Link } from "react-router-dom";
import { series } from "./series.data";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div>
      <Header />
      <main className="wrap">
        <section className="grid">
          {series.map((s) => (
            <figure key={s.id} className="span-6">
              <Link to={`/series/${s.id}`}>
                <img src={s.cover || (s.images[0]?.src || '')} alt={s.title} />
                <figcaption>{s.title}</figcaption>
              </Link>
            </figure>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}