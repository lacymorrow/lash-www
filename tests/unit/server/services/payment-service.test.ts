import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentService } from "@/server/services/payment-service";

// Mock payment providers — no providers configured in unit test environment
vi.mock("@/server/providers", () => ({
	getEnabledProviders: vi.fn(() => []),
	getProvider: vi.fn(() => undefined),
	hasProvider: vi.fn(() => false),
	isProviderEnabled: vi.fn(() => false),
}));

import {
	getEnabledProviders,
	getProvider,
	hasProvider,
	isProviderEnabled,
} from "@/server/providers";

const mockGetEnabledProviders = vi.mocked(getEnabledProviders);
const mockGetProvider = vi.mocked(getProvider);
const mockHasProvider = vi.mocked(hasProvider);
const mockIsProviderEnabled = vi.mocked(isProviderEnabled);

describe("PaymentService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetEnabledProviders.mockReturnValue([]);
		mockHasProvider.mockReturnValue(false);
		mockIsProviderEnabled.mockReturnValue(false);
		mockGetProvider.mockReturnValue(undefined);
	});

	describe("hasUserPurchasedVariant", () => {
		it("returns false when db unavailable and no providers enabled", async () => {
			const result = await PaymentService.hasUserPurchasedVariant({
				userId: "user-1",
				variantId: "var-1",
			});
			expect(result).toBe(false);
		});

		it("returns false for unknown named provider", async () => {
			mockHasProvider.mockReturnValue(false);

			const result = await PaymentService.hasUserPurchasedVariant({
				userId: "user-1",
				variantId: "var-1",
				provider: "stripe",
			});
			expect(result).toBe(false);
		});

		it("delegates to named provider when specified and enabled", async () => {
			const mockProvider = {
				id: "lemonsqueezy",
				hasUserPurchasedProduct: vi.fn().mockResolvedValue(true),
			};
			mockHasProvider.mockReturnValue(true);
			mockIsProviderEnabled.mockReturnValue(true);
			mockGetProvider.mockReturnValue(mockProvider as any);

			const result = await PaymentService.hasUserPurchasedVariant({
				userId: "user-1",
				variantId: "var-1",
				provider: "lemonsqueezy",
			});

			expect(result).toBe(true);
			expect(mockProvider.hasUserPurchasedProduct).toHaveBeenCalledWith("user-1", "var-1");
		});

		it("returns true when any enabled provider confirms the purchase", async () => {
			const mockProvider = {
				id: "polar",
				hasUserPurchasedProduct: vi.fn().mockResolvedValue(true),
			};
			mockGetEnabledProviders.mockReturnValue([mockProvider as any]);

			const result = await PaymentService.hasUserPurchasedVariant({
				userId: "user-1",
				variantId: "var-1",
			});

			expect(result).toBe(true);
		});

		it("returns false when all enabled providers return false", async () => {
			const mockProvider = {
				id: "polar",
				hasUserPurchasedProduct: vi.fn().mockResolvedValue(false),
			};
			mockGetEnabledProviders.mockReturnValue([mockProvider as any]);

			const result = await PaymentService.hasUserPurchasedVariant({
				userId: "user-1",
				variantId: "var-1",
			});

			expect(result).toBe(false);
		});
	});

	describe("hasUserPurchasedProduct", () => {
		it("returns false when db unavailable and no providers enabled", async () => {
			const result = await PaymentService.hasUserPurchasedProduct({
				userId: "user-1",
				productId: "prod-1",
			});
			expect(result).toBe(false);
		});

		it("delegates to named provider when specified and enabled", async () => {
			const mockProvider = {
				id: "lemonsqueezy",
				hasUserPurchasedProduct: vi.fn().mockResolvedValue(true),
			};
			mockHasProvider.mockReturnValue(true);
			mockIsProviderEnabled.mockReturnValue(true);
			mockGetProvider.mockReturnValue(mockProvider as any);

			const result = await PaymentService.hasUserPurchasedProduct({
				userId: "user-1",
				productId: "prod-1",
				provider: "lemonsqueezy",
			});

			expect(result).toBe(true);
			expect(mockProvider.hasUserPurchasedProduct).toHaveBeenCalledWith("user-1", "prod-1");
		});

		it("returns false when all enabled providers return false", async () => {
			const mockProvider = {
				id: "polar",
				hasUserPurchasedProduct: vi.fn().mockResolvedValue(false),
			};
			mockGetEnabledProviders.mockReturnValue([mockProvider as any]);

			const result = await PaymentService.hasUserPurchasedProduct({
				userId: "user-1",
				productId: "prod-1",
			});

			expect(result).toBe(false);
		});
	});

	describe("getPaymentByOrderId", () => {
		it("returns null when db is unavailable", async () => {
			const result = await PaymentService.getPaymentByOrderId("order-123");
			expect(result).toBeNull();
		});
	});

	describe("getUserPayments", () => {
		it("returns empty array when db is unavailable", async () => {
			const result = await PaymentService.getUserPayments("user-1");
			expect(result).toEqual([]);
		});
	});

	describe("getPaymentsWithUsers", () => {
		it("returns empty array when db unavailable and no providers enabled", async () => {
			const result = await PaymentService.getPaymentsWithUsers();
			expect(result).toEqual([]);
		});

		it("includes provider orders with isInDatabase: false when db is empty", async () => {
			const mockOrder = {
				id: "internal-1",
				orderId: "order-abc",
				userEmail: "buyer@example.com",
				userName: "Buyer Name",
				amount: 2999,
				status: "paid" as const,
				productName: "ShipKit Pro",
				purchaseDate: new Date("2026-01-15T00:00:00Z"),
				processor: "lemonsqueezy",
				isFreeProduct: false,
			};
			const mockProvider = {
				id: "lemonsqueezy",
				getAllOrders: vi.fn().mockResolvedValue([mockOrder]),
			};
			mockGetEnabledProviders.mockReturnValue([mockProvider as any]);

			const result = await PaymentService.getPaymentsWithUsers();

			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				orderId: "order-abc",
				userEmail: "buyer@example.com",
				productName: "ShipKit Pro",
				processor: "lemonsqueezy",
				isInDatabase: false,
			});
		});

		it("skips provider orders with missing orderId", async () => {
			const mockOrder = {
				id: "internal-2",
				orderId: "",
				userEmail: "buyer@example.com",
				userName: null,
				amount: 999,
				status: "paid" as const,
				productName: "ShipKit",
				purchaseDate: new Date(),
				processor: "polar",
				isFreeProduct: false,
			};
			const mockProvider = {
				id: "polar",
				getAllOrders: vi.fn().mockResolvedValue([mockOrder]),
			};
			mockGetEnabledProviders.mockReturnValue([mockProvider as any]);

			const result = await PaymentService.getPaymentsWithUsers();

			expect(result).toHaveLength(0);
		});
	});

	describe("getUsersWithPayments", () => {
		it("returns empty array when db is unavailable", async () => {
			const result = await PaymentService.getUsersWithPayments();
			expect(result).toEqual([]);
		});
	});

	describe("createPayment", () => {
		it("returns null when db is unavailable", async () => {
			const result = await PaymentService.createPayment({
				userId: "user-1",
				orderId: "order-new-1",
				amount: 4999,
				status: "paid",
				processor: "stripe",
			});
			expect(result).toBeNull();
		});
	});
});
