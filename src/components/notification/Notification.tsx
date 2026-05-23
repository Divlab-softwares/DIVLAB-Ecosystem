import { AnimatePresence, motion } from "framer-motion";
import Alert from "../ui/alert/Alert";


type props = {
    state: "error" | "success" | "warning" | "info",
    title: string,
    message: string,
}

const Notification = ({ state, title, message }: props) => {

    return (
        <AnimatePresence >
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4 }}
                className="fixed bottom-2 right-2 z-100">
                <Alert variant={state} title={title} message={message} />
            </motion.div>
        </AnimatePresence>
    );
}

export default Notification;