import PasswordInput from "@components/ui/password-input";
import Button from "@components/ui/button";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { fadeInTop } from "@utils/motion/fade-in-top";
import {
	useChangePasswordMutation,
	ChangePasswordInputType,
} from "@framework/customer/use-change-password";

const defaultValues = {
	oldPassword: "",
	newPassword: "",
	confirmPassword: "",
};

const ChangePassword: React.FC = () => {
	const { mutate: changePassword, isPending } = useChangePasswordMutation();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<ChangePasswordInputType>({
		defaultValues,
	});
	function onSubmit(input: ChangePasswordInputType) {
		changePassword(input);
	}
	const newPassword = watch("newPassword");
	return (
		<>
			<h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
				Change Password
			</h2>
			<motion.div
				layout
				initial="from"
				animate="to"
				exit="from"
				//@ts-ignore
				variants={fadeInTop(0.35)}
				className={`w-full flex  h-full lg:w-8/12 flex-col`}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="w-full mx-auto flex flex-col justify-center "
				>
					<div className="flex flex-col space-y-3">
						<PasswordInput
							labelKey="Old Password"
							errorKey={errors.oldPassword?.message}
							{...register("oldPassword", {
								required: "Old password is required",
							})}
							className="mb-4"
						/>
						<PasswordInput
							labelKey="New Password"
							errorKey={errors.newPassword?.message}
							{...register("newPassword", {
								required: "New password is required",
							})}
							className="mb-4"
						/>
						<PasswordInput
							labelKey="Confirm Password"
							errorKey={errors.confirmPassword?.message}
							{...register("confirmPassword", {
								required: "Confirm Password",
								validate: (value) => value === newPassword || "Passwords do not match",
							})}
							className="mb-4"
						/>
						{/* {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>} */}
						<div className="relative">
							<Button
								type="submit"
								loading={isPending}
								disabled={isPending}
								className="h-13 mt-3"
							>
								Change Password
							</Button>
						</div>
					</div>
				</form>
			</motion.div>
		</>
	);
};

export default ChangePassword;
