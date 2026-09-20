import { useEffect, useState } from "react";
import { api } from "../api";
import RecommendationCard from "../components/RecommendationCard";
import { Alert, PageHeader } from "../components/ui";

function Recommendations() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/recommendations")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <Alert tone="error">{error}</Alert>;
  }

  if (!data) {
    return <p className="text-sm text-muted">Loading suggestions...</p>;
  }

  return (
    <section>
      <PageHeader eyebrow="Reading desk" title="Suggested for you">
        Ranked with item-to-item similarity from books you rated or borrowed. Titles you already
        borrowed or rated are left out. Match is a relative similarity score, not model accuracy.
      </PageHeader>

      {data.student?.interests?.length ? (
        <p className="mb-6 text-sm text-muted">Based on: {data.student.interests.join(", ")}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {data.recommendations.map((item) => (
          <RecommendationCard key={item.book._id} item={item} />
        ))}
      </div>

      {data.recommendations.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          No suggestions yet. Borrow or rate a catalog title, or browse popular books on Home.
        </p>
      ) : null}
    </section>
  );
}

export default Recommendations;
