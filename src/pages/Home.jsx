import React from "react";
import { Link } from "react-router-dom";
import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="wrap">
        <section className="grid">
          {series.map((s) => (
            <figure key={s.id} className="span-6">
              <Link to={`/series/${s.id}`}>
                <img src={s.cover || (s.images[0]?.src || "")} alt={s.title} />
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