import React from "react";
import { Tabs } from "expo-router";
import { colors } from "@/constants/Colors";
import { Home, BarChart3, Plus, Wallet, FileText } from "lucide-react-native";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
                tabBarHideOnKeyboard: true,
                headerShown: false,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    // i don't want to show the label for this tab
                    title: "Home",
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="statistics"
                options={{
                    title: "Statistics",
                    tabBarIcon: ({ color }) => (
                        <BarChart3 size={24} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    tabBarButton: (props) => (
                        <AddButton
                            {...(props as {
                                onPress?: (
                                    event:
                                        | GestureResponderEvent
                                        | React.MouseEvent<Element, MouseEvent>
                                ) => void;
                            })}
                        />
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tabs.Screen
                name="budget"
                options={{
                    title: "Budget",
                    tabBarIcon: ({ color }) => (
                        <Wallet size={24} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color }) => (
                        <FileText size={24} color={color} />
                    ),
                    headerShown: false,
                }}
            />

            {/* Hide wallet/* and subscription/* files from tabs */}
            <Tabs.Screen
                name="wallet/index"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="wallet/new"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="wallet/edit"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="subscription/index"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="subscription/[id]/index"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="subscription/new"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="category/index"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="category/new"
                options={{
                    headerShown: false,
                    href: null,
                }}
            />
        </Tabs>
    );
}

function AddButton({
    onPress,
}: {
    onPress?: (
        event: GestureResponderEvent | React.MouseEvent<Element, MouseEvent>
    ) => void;
}) {
    return (
        <View style={styles.addButtonContainer}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={onPress}
                activeOpacity={0.8}>
                <Plus size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    addButtonContainer: {
        position: "relative",
        width: 80,
        alignItems: "center",
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        bottom: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
});
