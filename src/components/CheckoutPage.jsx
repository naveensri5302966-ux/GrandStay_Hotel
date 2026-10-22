import { useNavigate } from "react-router-dom";
import Payment from "./Payment";

export function CheckoutPage() {
  const navigate = useNavigate();

  const handlePaymentComplete = () => {
    navigate("/booking/confirmation");
  };

  return (
    <main className="min-h-screen bg-[#F8FBFF]">
      <Payment onPaymentComplete={handlePaymentComplete} />
    </main>
  );
}

export default CheckoutPage;
