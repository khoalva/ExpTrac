import { makeAutoObservable, runInAction } from "mobx";
import subscriptionService from "@/service/SubcriptionService";
import { Subscription } from "@/types";
import { db } from "@/service/database";

class SubscriptionStore {
  subscriptions: Subscription[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  currentSubscription: Subscription | null = null;
  isInitialized: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setCurrentSubscription(subscription: Subscription | null) {
    this.currentSubscription = subscription;
  }
  async initDatabase() {
    if (this.isInitialized) return true;
    
    this.setLoading(true);
    this.setError(null);
    try {
      // Call the service method to initialize the database
      await db.initDatabase();
      runInAction(() => {
        this.isInitialized = true;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to initialize subscription database");
        this.isInitialized = false;
      });
      return false;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }
  async fetchAllSubscriptions() {
    await this.initDatabase();
    this.setLoading(true);
    this.setError(null);
    try {
      const subscriptions = await subscriptionService.getAllSubscriptions();
      
      runInAction(() => {
        this.subscriptions = subscriptions;
      });
      return subscriptions;
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to fetch subscriptions");
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async createSubscription(subscription: Subscription) {
    await this.initDatabase();
    this.setLoading(true);
    this.setError(null);
    try {
      await subscriptionService.createSubscription(subscription);
      await this.fetchAllSubscriptions();
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to create subscription");
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async updateSubscription(name: string, subscription: Subscription) {
    await this.initDatabase();
    this.setLoading(true);
    this.setError(null);
    try {
      await subscriptionService.updateSubscription(name, subscription);
      await this.fetchAllSubscriptions();
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to update subscription");
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async deleteSubscription(name: string) {
    await this.initDatabase();
    this.setLoading(true);
    this.setError(null);
    try {
      await subscriptionService.deleteSubscription(name);
      runInAction(() => {
        this.subscriptions = this.subscriptions.filter(sub => sub.name !== name);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to delete subscription");
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async searchSubscriptions(name: string) {
    await this.initDatabase();
    this.setLoading(true);
    this.setError(null);
    try {
      const results = await subscriptionService.searchSubscriptionsByName(name);
      runInAction(() => {
        this.subscriptions = results;
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to search subscriptions");
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async getSubscriptionByName(name: string) {
    await this.initDatabase();
    this.setLoading(true);
    this.setError(null);
    try {
      const subscription = await subscriptionService.getSubscriptionByName(name);
      runInAction(() => {
        this.currentSubscription = subscription;
      });
      return subscription;
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : "Failed to fetch subscription");
      });
      return null;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }
}

const subscriptionStore = new SubscriptionStore();
export default subscriptionStore;