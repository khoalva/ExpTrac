import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/Colors";
import Modal from "../custom/Modal";
import Button from "../custom/Button";
import { AlertTriangle } from "lucide-react-native";

interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
}) => {
    const getIconColor = () => {
        switch (type) {
            case "danger":
                return colors.error;
            case "info":
                return colors.info;
            default:
                return colors.warning;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (type) {
            case "danger":
                return "error";
            case "info":
                return "primary";
            default:
                return "warning";
        }
    };

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            showCloseButton={false}
            contentStyle={styles.modalContent}>
            <View style={styles.container}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: `${getIconColor()}20` },
                    ]}>
                    <AlertTriangle size={40} color={getIconColor()} />
                </View>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>

                <View style={styles.buttonContainer}>
                    <Button
                        title={cancelText}
                        onPress={onClose}
                        variant="outline"
                        style={styles.cancelButton}
                    />
                    <Button
                        title={confirmText}
                        onPress={() => {
                            onConfirm();
                            onClose();
                        }}
                        variant="primary"
                        style={styles.confirmButton}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        padding: 0,
        borderRadius: 16,
        overflow: "hidden",
    },
    container: {
        padding: 24,
        alignItems: "center",
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
    },
    confirmButton: {
        flex: 1,
    },
});

export default ConfirmationModal;
