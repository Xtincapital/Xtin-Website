import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import axios from "axios";

const PurchasePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/courses/${courseId}`)
      .then((res) => setCourse(res.data.data))
      .catch((err) => console.error("Error fetching course:", err));
  }, [courseId]);

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
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

  if (!course) return <p>Loading course...</p>;

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 py-20 px-6 md:px-12 lg:px-24 mt-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600 my-4">{course.description}</p>
          <p className="text-green-600 font-bold text-xl">₹{course.price}</p>
          <button
            onClick={handlePurchase}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
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

