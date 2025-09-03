import React from "react";

export default function EditorPanel({
  intro, setIntro,
  images, updateCaption,
  editorials, addEditorial, updateEditorial, removeEditorial,
  onClose, onExport,
}) {
  return (
    <aside style={styles.wrap} aria-label="Editor">
      <div style={styles.header}>
        <strong>Editor</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onExport} style={styles.btn}>Export JSON</button>
          <button onClick={onClose} style={styles.btn}>Close</button>
        </div>
      </div>

      <section style={styles.section}>
        <h4 style={styles.h4}>Series intro</h4>
        <textarea
          value={intro}
          onChange={e => setIntro(e.target.value)}
          rows={3}
          placeholder="Intro / Lead…"
          style={styles.textarea}
        />
      </section>

      <section style={styles.section}>
        <h4 style={styles.h4}>Captions</h4>
        <div style={{ display: "grid", gap: 8 }}>
          {images.map((img, i) => (
            <label key={i} style={styles.label}>
              <div style={styles.small}>{img.src.split("/").pop()}</div>
              <input
                value={img.title || ""}
                onChange={e => updateCaption(i, e.target.value)}
                placeholder="Caption / Title"
                style={styles.input}
              />
            </label>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.row}>
          <h4 style={styles.h4}>Editorial blocks</h4>
          <button onClick={() => addEditorial(Math.max(0, images.length - 2))} style={styles.btn}>+ Add</button>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {editorials.map((ed, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.row}>
                <strong>Block #{i+1}</strong>
                <button onClick={() => removeEditorial(i)} style={styles.btnDanger}>Remove</button>
              </div>
              <div style={styles.grid2}>
                <label style={styles.label}>
                  <span style={styles.small}>Insert after image index</span>
                  <input type="number" min={0} value={ed.at}
                    onChange={e => updateEditorial(i, { at: Number(e.target.value) })}
                    style={styles.input}/>
                </label>
                <label style={styles.label}>
                  <span style={styles.small}>Span (4|6|8|12)</span>
                  <input type="number" min={4} max={12} step={2} value={ed.span}
                    onChange={e => updateEditorial(i, { span: Number(e.target.value) })}
                    style={styles.input}/>
                </label>
              </div>
              <label style={styles.label}>
                <span style={styles.small}>Kicker</span>
                <input value={ed.kicker || ""} onChange={e => updateEditorial(i, { kicker: e.target.value })} style={styles.input}/>
              </label>
              <label style={styles.label}>
                <span style={styles.small}>Title</span>
                <input value={ed.title || ""} onChange={e => updateEditorial(i, { title: e.target.value })} style={styles.input}/>
              </label>
              <label style={styles.label}>
                <span style={styles.small}>Body</span>
                <textarea rows={3} value={ed.body || ""} onChange={e => updateEditorial(i, { body: e.target.value })} style={styles.textarea}/>
              </label>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

const styles = {
  wrap: { position: "fixed", top: 0, right: 0, height: "100vh", width: 360, background: "rgba(20,20,20,.96)", color: "#ddd", borderLeft: "1px solid #333", padding: 14, zIndex: 2000, overflow: "auto", backdropFilter: "blur(6px)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  section: { borderTop: "1px solid #2a2a2a", paddingTop: 12, marginTop: 10 },
  h4: { margin: "0 0 8px 0", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "#aaa" },
  input: { width: "100%", padding: "8px 10px", background: "#131313", color: "#eee", border: "1px solid #2e2e2e", borderRadius: 8 },
  textarea: { width: "100%", padding: 10, background: "#131313", color: "#eee", border: "1px solid #2e2e2e", borderRadius: 8 },
  small: { fontSize: 11, color: "#aaa", display: "block", marginBottom: 4 },
  label: { display: "grid", gap: 6 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  btn: { background: "#222", color: "#eee", border: "1px solid #333", padding: "6px 10px", borderRadius: 8, cursor: "pointer" },
  btnDanger: { background: "#2a1212", color: "#eee", border: "1px solid #4a1a1a", padding: "6px 10px", borderRadius: 8, cursor: "pointer" },
  card: { border: "1px solid #2e2e2e", borderRadius: 10, padding: 10, background: "#101010" },
};