import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewWalletScreen() {
    return (
        <SafeAreaView>
            <View className="flex-1 bg-background justify-center items-center">
                <Text className="text-textPrimary">New Wallet</Text>
            </View>
        </SafeAreaView>
    );
}
