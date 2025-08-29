/**
 * Crystal Clear Architecture - Testing Infrastructure
 * Testing-ready patterns for Domain-Driven Design
 */

import {
  DomainError,
  ErrorCode,
  ErrorSeverity,
  DomainErrorFactory,
} from "../errors/domain-errors";
import { DomainLogger, LogEntry, LogTransport } from "../logging/domain-logger";

// Test Context for managing test state
export interface TestContext {
  correlationId: string;
  domain: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

// Mock Logger for testing
export class MockLogger implements LogTransport {
  public logs: LogEntry[] = [];

  async write(entry: LogEntry): Promise<void> {
    this.logs.push(entry);
  }

  clear(): void {
    this.logs = [];
  }

  getLogsByLevel(level: number): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  getLogsByDomain(domain: string): LogEntry[] {
    return this.logs.filter((log) => log.context.domain === domain);
  }

  findLog(predicate: (entry: LogEntry) => boolean): LogEntry | undefined {
    return this.logs.find(predicate);
  }

  hasLogWithMessage(message: string): boolean {
    return this.logs.some((log) => log.message.includes(message));
  }
}

// Test Error Handler for capturing errors in tests
export class TestErrorHandler {
  public capturedErrors: DomainError[] = [];
  private shouldThrow: boolean = true;

  capture(error: DomainError): void {
    this.capturedErrors.push(error);
    if (this.shouldThrow) {
      throw error;
    }
  }

  clear(): void {
    this.capturedErrors = [];
  }

  getLastError(): DomainError | undefined {
    return this.capturedErrors[this.capturedErrors.length - 1];
  }

  getErrorsByCode(code: ErrorCode): DomainError[] {
    return this.capturedErrors.filter((error) => error.code === code);
  }

  setShouldThrow(shouldThrow: boolean): void {
    this.shouldThrow = shouldThrow;
  }

  expectError(code: ErrorCode, message?: string): void {
    const error = this.getLastError();
    if (!error) {
      throw new Error("Expected error to be thrown, but none was captured");
    }
    if (error.code !== code) {
      throw new Error(`Expected error code ${code}, got ${error.code}`);
    }
    if (message && !error.message.includes(message)) {
      throw new Error(
        `Expected error message to contain "${message}", got "${error.message}"`,
      );
    }
  }
}

// Test Database for in-memory testing
export class TestDatabase {
  private collections: Map<string, any[]> = new Map();

  async save<T>(collection: string, entity: T): Promise<T> {
    const entities = this.collections.get(collection) || [];
    entities.push(entity);
    this.collections.set(collection, entities);
    return entity;
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const entities = this.collections.get(collection) || [];
    return entities.find((entity: any) => entity.id === id) || null;
  }

  async findAll<T>(collection: string): Promise<T[]> {
    return (this.collections.get(collection) || []) as T[];
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const entities = this.collections.get(collection) || [];
    const index = entities.findIndex((entity: any) => entity.id === id);
    if (index === -1) return false;

    entities.splice(index, 1);
    return true;
  }

  async clear(collection?: string): Promise<void> {
    if (collection) {
      this.collections.delete(collection);
    } else {
      this.collections.clear();
    }
  }

  getCollectionSize(collection: string): number {
    return this.collections.get(collection)?.length || 0;
  }
}

// Test HTTP Client for mocking external API calls
export class TestHttpClient {
  private responses: Map<string, any> = new Map();
  private calls: Array<{
    url: string;
    method: string;
    data?: any;
    headers?: Record<string, string>;
  }> = [];

  mockResponse(url: string, response: any): void {
    this.responses.set(url, response);
  }

  mockError(url: string, error: Error): void {
    this.responses.set(url, error);
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.calls.push({ url, method: "GET", headers });
    const response = this.responses.get(url);

    if (response instanceof Error) {
      throw response;
    }

    return response as T;
  }

  async post<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    this.calls.push({ url, method: "POST", data, headers });
    const response = this.responses.get(url);

    if (response instanceof Error) {
      throw response;
    }

    return response as T;
  }

  async put<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    this.calls.push({ url, method: "PUT", data, headers });
    const response = this.responses.get(url);

    if (response instanceof Error) {
      throw response;
    }

    return response as T;
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.calls.push({ url, method: "DELETE", headers });
    const response = this.responses.get(url);

    if (response instanceof Error) {
      throw response;
    }

    return response as T;
  }

  getCalls(): Array<{
    url: string;
    method: string;
    data?: any;
    headers?: Record<string, string>;
  }> {
    return [...this.calls];
  }

  getCallsTo(
    url: string,
  ): Array<{
    url: string;
    method: string;
    data?: any;
    headers?: Record<string, string>;
  }> {
    return this.calls.filter((call) => call.url === url);
  }

  clear(): void {
    this.responses.clear();
    this.calls = [];
  }
}

// Test Clock for time-dependent testing
export class TestClock {
  private currentTime: Date;

  constructor(initialTime: Date = new Date()) {
    this.currentTime = new Date(initialTime);
  }

  now(): Date {
    return new Date(this.currentTime);
  }

  advanceTime(milliseconds: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
  }

  setTime(newTime: Date): void {
    this.currentTime = new Date(newTime);
  }

  reset(): void {
    this.currentTime = new Date();
  }
}

// Test Event Bus for testing domain events
export class TestEventBus {
  private events: Array<{ type: string; payload: any; timestamp: Date }> = [];
  private handlers: Map<string, Function[]> = new Map();

  publish(eventType: string, payload: any): void {
    this.events.push({
      type: eventType,
      payload,
      timestamp: new Date(),
    });

    const handlers = this.handlers.get(eventType) || [];
    handlers.forEach((handler) => handler(payload));
  }

  subscribe(eventType: string, handler: Function): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler: Function): void {
    const handlers = this.handlers.get(eventType) || [];
    const filteredHandlers = handlers.filter((h) => h !== handler);
    if (filteredHandlers.length === 0) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.set(eventType, filteredHandlers);
    }
  }

  getEvents(): Array<{ type: string; payload: any; timestamp: Date }> {
    return [...this.events];
  }

  getEventsByType(
    eventType: string,
  ): Array<{ type: string; payload: any; timestamp: Date }> {
    return this.events.filter((event) => event.type === eventType);
  }

  clear(): void {
    this.events = [];
    this.handlers.clear();
  }

  hasEvent(eventType: string, predicate?: (payload: any) => boolean): boolean {
    return this.events.some(
      (event) =>
        event.type === eventType && (!predicate || predicate(event.payload)),
    );
  }
}

// Test Utilities for common testing patterns
export class TestUtils {
  static createTestContext(
    domain: string,
    overrides: Partial<TestContext> = {},
  ): TestContext {
    return {
      correlationId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      domain,
      userId: "test-user-123",
      sessionId: "test-session-456",
      metadata: {},
      ...overrides,
    };
  }

  static createTestLogger(): MockLogger {
    return new MockLogger();
  }

  static createTestErrorHandler(): TestErrorHandler {
    return new TestErrorHandler();
  }

  static createTestDatabase(): TestDatabase {
    return new TestDatabase();
  }

  static createTestHttpClient(): TestHttpClient {
    return new TestHttpClient();
  }

  static createTestClock(initialTime?: Date): TestClock {
    return new TestClock(initialTime);
  }

  static createTestEventBus(): TestEventBus {
    return new TestEventBus();
  }

  static createDomainErrorFactory(domain: string): DomainErrorFactory {
    return new DomainErrorFactory(domain);
  }
}

// Test Setup Helper - Combines common test infrastructure
export class TestSetup {
  public context: TestContext;
  public logger: MockLogger;
  public errorHandler: TestErrorHandler;
  public database: TestDatabase;
  public httpClient: TestHttpClient;
  public clock: TestClock;
  public eventBus: TestEventBus;
  public errorFactory: DomainErrorFactory;

  constructor(domain: string, contextOverrides: Partial<TestContext> = {}) {
    this.context = TestUtils.createTestContext(domain, contextOverrides);
    this.logger = TestUtils.createTestLogger();
    this.errorHandler = TestUtils.createTestErrorHandler();
    this.database = TestUtils.createTestDatabase();
    this.httpClient = TestUtils.createTestHttpClient();
    this.clock = TestUtils.createTestClock();
    this.eventBus = TestUtils.createTestEventBus();
    this.errorFactory = TestUtils.createDomainErrorFactory(domain);
  }

  reset(): void {
    this.logger.clear();
    this.errorHandler.clear();
    this.database.clear();
    this.httpClient.clear();
    this.eventBus.clear();
  }

  // Helper for testing async operations
  async expectAsync<T>(
    operation: () => Promise<T>,
    expectedResult?: T,
    expectedError?: ErrorCode,
  ): Promise<T> {
    try {
      const result = await operation();

      if (expectedError) {
        throw new Error(
          `Expected error ${expectedError}, but operation succeeded`,
        );
      }

      if (
        expectedResult !== undefined &&
        JSON.stringify(result) !== JSON.stringify(expectedResult)
      ) {
        throw new Error(
          `Expected result ${JSON.stringify(expectedResult)}, got ${JSON.stringify(result)}`,
        );
      }

      return result;
    } catch (error) {
      if (expectedError) {
        if (error instanceof DomainError && error.code === expectedError) {
          return undefined as T;
        }
        throw new Error(
          `Expected error ${expectedError}, got ${error instanceof DomainError ? error.code : error}`,
        );
      }
      throw error;
    }
  }

  // Helper for testing domain events
  expectEvent(eventType: string, predicate?: (payload: any) => boolean): void {
    if (!this.eventBus.hasEvent(eventType, predicate)) {
      throw new Error(`Expected event ${eventType} was not published`);
    }
  }

  // Helper for testing log messages
  expectLog(message: string, level?: number): void {
    if (!this.logger.hasLogWithMessage(message)) {
      throw new Error(`Expected log message "${message}" was not found`);
    }

    if (level !== undefined) {
      const logs = this.logger.getLogsByLevel(level);
      const hasMessage = logs.some((log) => log.message.includes(message));
      if (!hasMessage) {
        throw new Error(
          `Expected log message "${message}" at level ${level} was not found`,
        );
      }
    }
  }
}

// Test Fixtures for common domain objects
export class TestFixtures {
  static createUser(overrides: Partial<any> = {}): any {
    return {
      id: "user-123",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createVipClient(overrides: Partial<any> = {}): any {
    return {
      id: "vip-123",
      userId: "user-123",
      tier: "platinum",
      commission: 0.05,
      managerId: "manager-456",
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createSportsEvent(overrides: Partial<any> = {}): any {
    return {
      id: "event-123",
      sport: "football",
      teams: ["Team A", "Team B"],
      startTime: new Date(Date.now() + 3600000), // 1 hour from now
      odds: { home: 2.1, away: 3.2, draw: 3.5 },
      status: "scheduled",
      ...overrides,
    };
  }

  static createBet(overrides: Partial<any> = {}): any {
    return {
      id: "bet-123",
      userId: "user-123",
      eventId: "event-123",
      amount: 100,
      odds: 2.1,
      type: "moneyline",
      selection: "home",
      status: "pending",
      createdAt: new Date(),
      ...overrides,
    };
  }
}

// Test Assertions for domain-specific validations
export class DomainAssertions {
  static assertValidEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }

  static assertValidId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("ID cannot be empty");
    }
  }

  static assertPositiveAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error(`Amount must be positive, got: ${amount}`);
    }
  }

  static assertValidDate(date: Date): void {
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }
  }

  static assertStringLength(
    value: string,
    min: number,
    max: number,
    fieldName: string,
  ): void {
    if (value.length < min) {
      throw new Error(`${fieldName} must be at least ${min} characters`);
    }
    if (value.length > max) {
      throw new Error(`${fieldName} must be at most ${max} characters`);
    }
  }
}
