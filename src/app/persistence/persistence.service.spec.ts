import { PersistenceService } from './persistence.service';
import { createDefaultConfig } from '../models';

describe('PersistenceService', () => {
  let service: PersistenceService;
  const storageKey = 'cabinet-calculator-project';

  beforeEach(() => {
    service = new PersistenceService();
    localStorage.clear();
  });

  it('should save and load a project from localStorage', () => {
    const config = createDefaultConfig();
    config.cabinets = [{ name: 'Test', width: 600, quantity: 2 }];

    service.save(config);
    const loaded = service.load();

    expect(loaded).toEqual(config);
  });

  it('should return null when no saved project exists', () => {
    expect(service.load()).toBeNull();
  });

  it('should return null for invalid JSON in localStorage', () => {
    localStorage.setItem(storageKey, 'not-json');
    expect(service.load()).toBeNull();
  });

  it('should return null for JSON missing required fields', () => {
    localStorage.setItem(storageKey, '{"foo": "bar"}');
    expect(service.load()).toBeNull();
  });

  it('should import valid JSON from file', async () => {
    const config = createDefaultConfig();
    const file = new File([JSON.stringify(config)], 'test.json', { type: 'application/json' });

    const imported = await service.importJson(file);
    expect(imported).toEqual(config);
  });

  it('should reject invalid JSON file', async () => {
    const file = new File(['not-json'], 'bad.json', { type: 'application/json' });
    await expect(service.importJson(file)).rejects.toThrow('Invalid project file');
  });
});
