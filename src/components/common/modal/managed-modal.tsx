import { useUI } from "@contexts/ui.context";
import Modal from "./modal";
import dynamic from "next/dynamic";
import Newsletter from "../newsletter";
const LoginForm = dynamic(() => import("@components/auth/login-form"));
const ForgetPasswordForm = dynamic(
	() => import("@components/auth/forget-password-form")
);
const ProductPopup = dynamic(() => import("@components/product/product-popup"));
const ManagedModal: React.FC = () => {
	const { displayModal, isAuthorized, closeModal, modalView } = useUI();
	return (
		<Modal open={displayModal && (modalView !== "NEWSLETTER_VIEW" || isAuthorized)} onClose={closeModal}>
			{modalView === "LOGIN_VIEW" && <LoginForm />}
			{modalView === "FORGET_PASSWORD" && <ForgetPasswordForm />}
			{modalView === "PRODUCT_VIEW" && <ProductPopup />}
			{isAuthorized && modalView === "NEWSLETTER_VIEW" && <Newsletter />}
		</Modal>
	);
};

export default ManagedModal;
