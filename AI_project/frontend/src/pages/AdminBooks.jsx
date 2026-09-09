import { useEffect, useState } from "react";
import { api } from "../api";
import { Alert, PageHeader } from "../components/ui";

const emptyForm = {
  title: "",
  author: "",
  description: "",
  genre: "Programming",
  totalCopies: 1,
  availableCopies: 1,
  coverImage: "",
};

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await api("/api/books");
    setBooks(data.books);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function startEdit(book) {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description || "",
      genre: book.genre,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      coverImage: book.coverImage || "",
    });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await api(`/api/books/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setMessage("Book updated.");
      } else {
        await api("/api/books", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            availableCopies:
              form.availableCopies === "" ? Number(form.totalCopies) : Number(form.availableCopies),
          }),
        });
        setMessage("Book added.");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this book?")) return;
    setError("");
    setMessage("");
    try {
      await api(`/api/books/${id}`, { method: "DELETE" });
      setMessage("Book deleted.");
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const q = filter.trim().toLowerCase();
  const visible = q
    ? books.filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.genre.toLowerCase().includes(q)
      )
    : books;

  return (
    <section>
      <PageHeader eyebrow="Staff desk" title={editingId ? "Edit book" : "Catalog management"}>
        Add or update titles in the collection. Books that are currently on loan cannot be deleted.
      </PageHeader>

      <Alert tone="ok">{message}</Alert>
      <Alert tone="error">{error}</Alert>

      <form onSubmit={save} className="grid gap-3 border border-line bg-surface p-5 sm:grid-cols-2">
        <div>
          <label htmlFor="book-title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="book-title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="book-author" className="text-sm font-medium">
            Author
          </label>
          <input
            id="book-author"
            required
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="book-genre" className="text-sm font-medium">
            Genre
          </label>
          <input
            id="book-genre"
            required
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="book-cover" className="text-sm font-medium">
            Cover image URL
          </label>
          <input
            id="book-cover"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="book-total" className="text-sm font-medium">
            Total copies
          </label>
          <input
            id="book-total"
            type="number"
            min="0"
            required
            value={form.totalCopies}
            onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="book-available" className="text-sm font-medium">
            Available copies
          </label>
          <input
            id="book-available"
            type="number"
            min="0"
            value={form.availableCopies}
            onChange={(e) => setForm({ ...form, availableCopies: e.target.value })}
            className="field"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="book-desc" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="book-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="field"
            rows={3}
          />
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Save changes" : "Add book"}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-8">
        <label htmlFor="book-filter" className="text-sm font-medium">
          Filter list
        </label>
        <input
          id="book-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Title, author, or genre"
          className="field max-w-sm"
        />
      </div>

      <div className="mt-4 overflow-x-auto border border-line bg-surface">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Genre</th>
              <th>Copies</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((book) => (
              <tr key={book._id}>
                <td>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-muted">{book.author}</p>
                </td>
                <td>{book.genre}</td>
                <td>
                  {book.availableCopies}/{book.totalCopies}
                </td>
                <td className="text-right">
                  <button type="button" onClick={() => startEdit(book)} className="mr-3 text-sm font-medium text-accent hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(book._id)} className="text-sm font-medium text-accent hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminBooks;
