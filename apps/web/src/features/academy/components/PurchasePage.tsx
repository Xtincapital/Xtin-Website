import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import axios from "axios";

const PurchasePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/courses/${courseId}`)
      .then((res) => setCourse(res.data.data))
      .catch((err) => {
        console.error("Error fetching course:", err);
        setLoadFailed(true);
      });
  }, [courseId]);

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/courses/${courseId}/purchase`,
        {
          transactionId: `txn_${Date.now()}`, // dummy value
          pricePaid: course.price,
          paymentMethod: "dummy_gateway", // dummy value
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Purchase successful!");
      navigate("/learn");
    } catch (error) {
      console.error("Error purchasing course:", error);
      alert("Failed to purchase course");
    }
  };

  if (!course) {
    return (
      <div className="bg-white text-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
          {loadFailed ? (
            <>
              <h1 className="xt-title mb-2">We couldn't load this course</h1>
              <p className="text-gray-600 mb-6">Please check the link or try again in a moment.</p>
              <Link to="/learn" className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition">
                Browse courses
              </Link>
            </>
          ) : (
            <p className="text-gray-600">Loading course...</p>
          )}
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 py-20 px-6 md:px-12 lg:px-24 mt-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-display font-normal tracking-[-0.015em]">{course.title}</h1>
          <p className="text-gray-600 my-4">{course.description}</p>
          <p className="text-green-600 font-bold text-xl">₹{course.price}</p>
          <button
            onClick={handlePurchase}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Pay Now
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PurchasePage;

