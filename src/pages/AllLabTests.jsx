import { 
  Search, ChevronRight, ArrowLeft, FlaskConical, Clock, Heart, ShieldCheck, 
  Droplets, Beaker, Stethoscope, TestTube, MapPin, ArrowRight, X, Filter 
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDiagnosticTests } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import SelectSlotUI from "../components/doctors/SelectSlotUI";
import Modal from "../components/common/Modal";

function toTitleCase(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map(word => {
      if (word === "-" || word === "&" || word === "/") return word;
      if (word.startsWith("(") && word.endsWith(")")) {
        return "(" + word.slice(1, -1).toUpperCase() + ")";
      }
      if (["rft", "lft", "cbc", "tsh", "hba1c"].includes(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export default function AllLabTests() {
  const go = useNavigate();
  const { setBookingType, setLabPackage, setDate, setSlot, setBookingId } = useBooking();
  const { user, openLoginModal } = useAuth();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visitType, setVisitType] = useState("home");
  const isInitialMount = useRef(true);

  // Fetch tests from API and apply filter upon response
  const fetchTestsFromApi = (searchKeyword = "") => {
    setLoading(true);
    setAppliedQuery(searchKeyword);

    const payload = {
      pageSize: 300,
      search: searchKeyword,
      q: searchKeyword,
      filter: searchKeyword ? ` AND (service_name LIKE '%${searchKeyword}%' OR name LIKE '%${searchKeyword}%' OR profile_name LIKE '%${searchKeyword}%')` : ""
    };

    getDiagnosticTests(payload)
      .then((apiTests) => {
        if (Array.isArray(apiTests)) {
          const normalized = apiTests.map((t, idx) => {
            const rawTitle = t.service_name || t.name || t.title || t.test_name || `Lab Test ${idx + 1}`;
            const rawCategory = t.profile_name || t.category || t.test_category_name || t.department || "Fluid & Clinical Test";
            const priceVal = parseFloat(t.price || t.cost || t.amount || 150);

            return {
              id: t.id || t.service_key || `api-test-${idx}`,
              title: toTitleCase(rawTitle),
              rawTitle: String(rawTitle),
              category: rawCategory,
              price: priceVal,
              fasting: t.fasting || (t.fasting_required ? "Fasting Required" : "No Fasting Required"),
              reportTime: t.reportTime || t.report_time || "24 Hours",
              img: t.img || t.image || "/lab_test_sample.png"
            };
          });
          setTests(normalized);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("AllLabTests fetch error:", err);
        setLoading(false);
      });
  };

  // Initial fetch on page load
  useEffect(() => {
    fetchTestsFromApi("");
  }, []);

  // Trigger API and clear filter in UI when search bar input length becomes 0 (after backspace / clearing)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (q.trim().length === 0 && appliedQuery !== "") {
      fetchTestsFromApi("");
    }
  }, [q, appliedQuery]);

  // Extract unique profiles/categories for filter chips
  const profileList = useMemo(() => {
    const set = new Set();
    tests.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return ["All", ...Array.from(set)];
  }, [tests]);

  // Filtered list applied in UI ONLY after API triggers
  const filteredTests = useMemo(() => {
    return tests.filter(item => {
      if (appliedQuery) {
        const queryLower = appliedQuery.toLowerCase();
        const matchQ = (item.title || "").toLowerCase().includes(queryLower) || 
                       (item.category || "").toLowerCase().includes(queryLower) ||
                       (item.rawTitle || "").toLowerCase().includes(queryLower);
        if (!matchQ) return false;
      }
      if (selectedProfile !== "All") {
        return (item.category || "").toLowerCase() === selectedProfile.toLowerCase();
      }
      return true;
    });
  }, [tests, appliedQuery, selectedProfile]);

  const confirmBooking = (slotData) => {
    setBookingType("lab");
    setLabPackage(selectedItem);
    setDate(new Date(slotData.date));
    setSlot(slotData.time);
    if (!user) return openLoginModal("/confirmed");
    setBookingId("LAB" + Math.floor(Math.random() * 100000000));
    go("/confirmed");
  };

  return (
    <main className="page page-enter" style={{ padding: 0, background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh' }}>
      
      {/* Styles */}
      <style>{`
        .all-tests-hero {
          background: #ffffff;
          border-bottom: 1px solid var(--border);
          padding: 24px 0 28px 0;
        }

        .all-tests-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(18, 51, 58, 0.05);
          position: relative;
        }

        .all-tests-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 32px rgba(18, 51, 58, 0.12);
          border-color: var(--primary-soft);
        }

        .all-tests-card-img-container {
          height: 130px;
          width: 100%;
          background: #f0f7f7;
          overflow: hidden;
          position: relative;
        }

        .all-tests-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s;
        }

        .all-tests-card:hover .all-tests-card-img {
          transform: scale(1.06);
        }

        .all-tests-card-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          color: var(--primary-dark);
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 12px;
          border: 1px solid rgba(46, 102, 110, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .all-tests-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .all-tests-card-title {
          font-family: 'Plus Jakarta Sans', var(--font-sans);
          font-weight: 700;
          font-size: 15px;
          line-height: 1.35;
          color: #12333A;
          margin-bottom: 6px;
          min-height: 40px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .all-tests-card-sub {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          background: #f0f7f7;
          padding: 4px 10px;
          border-radius: 10px;
          width: fit-content;
          margin-bottom: 16px;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .all-tests-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px dashed var(--border);
        }

        .all-tests-card-price-col {
          display: flex;
          flex-direction: column;
        }

        .all-tests-card-price-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .all-tests-card-price {
          font-weight: 800;
          font-size: 18px;
          color: #12333A;
          line-height: 1.1;
        }

        .all-tests-card-btn {
          background: #1b4d54;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(27, 77, 84, 0.2);
        }

        .all-tests-card-btn:hover {
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(46, 102, 110, 0.35);
          transform: translateY(-1px);
        .all-tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .all-tests-hero {
            padding: 16px 0 20px 0;
          }
          .all-tests-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .all-tests-card-body {
            padding: 12px;
          }
          .all-tests-card-title {
            font-size: 13.5px;
            min-height: 34px;
          }
          .all-tests-card-sub {
            font-size: 10.5px;
            padding: 3px 8px;
            margin-bottom: 10px;
          }
          .all-tests-card-price {
            font-size: 16px;
          }
          .all-tests-card-btn {
            padding: 6px 11px;
            font-size: 11.5px;
            border-radius: 16px;
            white-space: nowrap;
          }
        }

        @media (max-width: 440px) {
          .all-tests-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .all-tests-card-img-container {
            height: 100px;
          }
          .all-tests-card-body {
            padding: 10px 8px;
          }
          .all-tests-card-title {
            font-size: 12.5px;
            line-height: 1.25;
            min-height: 32px;
          }
        }
      `}</style>

      {/* Hero / Header Section */}
      <div className="all-tests-hero">
        <div className="container">
          
          {/* Top Breadcrumb & Back */}
          <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="app-breadcrumbs">
              <Link to="/">Home</Link> 
              <ChevronRight size={12} /> 
              <Link to="/labs">Lab Tests</Link> 
              <ChevronRight size={12} /> 
              <span>All Lab Tests</span>
            </div>

            <button 
              onClick={() => go('/labs')}
              className="btn btn-secondary flex items-center gap-2"
              style={{ fontSize: '13px', fontWeight: '700', padding: '6px 14px', borderRadius: '20px' }}
            >
              <ArrowLeft size={15} /> Back to Lab Tests
            </button>
          </div>

          <h1 style={{ 
            fontFamily: "'Plus Jakarta Sans', var(--font-sans)", 
            fontWeight: 800, 
            fontSize: '24px', 
            color: '#12333A', 
            margin: '0 0 6px 0' 
          }}>
            All Diagnostic Lab Tests
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
            Showing NABL & ISO certified individual diagnostic lab tests with doorstep phlebotomist collection.
          </p>

          {/* Search Bar & Profile Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ 
              background: '#ffffff', 
              border: '1.5px solid var(--border)', 
              borderRadius: '16px', 
              padding: '6px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px', flexShrink: 0 }} />
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  fetchTestsFromApi(q.trim()); 
                }} 
                style={{ flex: 1, display: 'flex', alignItems: 'center' }}
              >
                <input
                  placeholder="Search by test name, profile (e.g. Creatinine, Bilirubin, Uric Acid)..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchTestsFromApi(q.trim());
                    }
                  }}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    outline: 'none', 
                    width: '100%', 
                    fontSize: '14.5px', 
                    color: 'var(--text-main)', 
                    padding: '10px 0',
                    fontWeight: '500'
                  }}
                />
              </form>
              {q && (
                <button 
                  onClick={() => {
                    setQ("");
                    fetchTestsFromApi("");
                  }} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid Content */}
      <div className="container" style={{ padding: '32px 16px 64px 16px' }}>

        {/* Results Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>
            Showing {filteredTests.length} {filteredTests.length === 1 ? 'Lab Test' : 'Lab Tests'}
          </span>
        </div>

        {loading ? (
          <div className="all-tests-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="all-tests-card" style={{ height: '280px' }}>
                <div className="skeleton" style={{ height: '120px' }} />
                <div style={{ padding: '16px' }}>
                  <div className="skeleton skeleton-title" style={{ width: '80%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FlaskConical size={48} style={{ opacity: 0.25, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>No lab tests found</h3>
            <p>Try searching for a different test name or clearing your filter.</p>
          </div>
        ) : (
          <div className="all-tests-grid">
            {filteredTests.map((test) => (
              <div className="all-tests-card" key={test.id}>
                <div className="all-tests-card-img-container">
                  <img src={test.img} alt={test.title} className="all-tests-card-img" />
                  <span className="all-tests-card-tag"><TestTube size={10} /> Certified</span>
                </div>
                <div className="all-tests-card-body">
                  <div className="all-tests-card-title">{test.title}</div>
                  <div className="all-tests-card-sub">{toTitleCase(test.category)}</div>
                  <div className="all-tests-card-footer">
                    <div className="all-tests-card-price-col">
                      <span className="all-tests-card-price-label">Price</span>
                      <span className="all-tests-card-price">₹{test.price}</span>
                    </div>
                    <button className="all-tests-card-btn" onClick={() => setSelectedItem(test)}>
                      Book Now <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Schedule Lab Test"
        maxWidth="680px"
      >
        {selectedItem && (
          <div style={{ marginBottom: "24px", padding: '18px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{selectedItem.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedItem.category}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>₹{selectedItem.price.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                <Clock size={14} color="var(--primary)" /> <b>Report Delivery:</b> {selectedItem.reportTime || "24 Hours"}
              </div>
              <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                <ShieldCheck size={14} color="#16a34a" /> <b>Fasting:</b> {selectedItem.fasting || "No Fasting Required"}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px" }}>
            Select Collection Preference
          </label>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <label style={{ 
              background: visitType === 'home' ? 'var(--primary-light)' : '#ffffff', 
              padding: '16px', 
              borderRadius: '16px', 
              border: visitType === 'home' ? '2px solid var(--primary)' : '1px solid var(--border)', 
              flex: 1, 
              minWidth: '200px', 
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}>
              <input type="radio" name="labVisitType" value="home" checked={visitType === 'home'} onChange={() => setVisitType('home')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: visitType === 'home' ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>
                  🏡 Home Sample Collection
                </b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>A certified phlebotomist visits your doorstep.</small>
              </div>
            </label>
            <label style={{ 
              background: visitType === 'lab' ? 'var(--primary-light)' : '#ffffff', 
              padding: '16px', 
              borderRadius: '16px', 
              border: visitType === 'lab' ? '2px solid var(--primary)' : '1px solid var(--border)', 
              flex: 1, 
              minWidth: '200px', 
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}>
              <input type="radio" name="labVisitType" value="lab" checked={visitType === 'lab'} onChange={() => setVisitType('lab')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: visitType === 'lab' ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>
                  🏥 Diagnostic Center Visit
                </b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>Walk-in to your nearest accredited partner lab.</small>
              </div>
            </label>
          </div>
        </div>

        <SelectSlotUI onConfirm={confirmBooking} type="lab" />
      </Modal>

    </main>
  );
}
