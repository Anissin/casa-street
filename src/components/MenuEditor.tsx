import { useState, type ChangeEvent, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import {
  type CategoryTextInput,
  type CmsState,
  type MenuCategory,
  type MenuCategoryId,
  type MenuItem,
  type MenuItemErrors,
  type MenuItemInput,
  deleteMenuItem,
  emptyMenuItemInput,
  menuItemToInput,
  moveMenuItem,
  setMenuItemHidden,
  updateCategoryText,
  upsertMenuItem,
  validateCategoryText,
  validateMenuItemInput,
} from '../lib/cms';
import { checkPhotoFile, downscaleImage, uploadOwnerPhoto } from '../lib/imageUpload';

interface MenuEditorProps {
  cms: CmsState;
  ownerToken: string;
  saving: boolean;
  applyCmsUpdate: (next: CmsState) => Promise<boolean>;
}

type Draft = { categoryId: MenuCategoryId; input: MenuItemInput; original?: MenuItem };

const inputClass =
  'w-full min-h-11 px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#C8281E]/40';

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-[#141413]">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : (
        hint && <p className="text-[11px] text-neutral-500">{hint}</p>
      )}
    </div>
  );
}

function categoryLabel(cat: MenuCategory) {
  return cat.published ? cat.title : `${cat.title} (draft — not public)`;
}

export function MenuEditor({ cms, ownerToken, saving, applyCmsUpdate }: MenuEditorProps) {
  const [categoryId, setCategoryId] = useState<MenuCategoryId>(cms.menuCategories[0].id);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<MenuItemErrors>({});
  const [photoBusy, setPhotoBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sectionDraft, setSectionDraft] = useState<CategoryTextInput | null>(null);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<keyof CategoryTextInput, string>>>({});

  const category = cms.menuCategories.find((c) => c.id === categoryId) ?? cms.menuCategories[0];

  function startAdd() {
    setNotice(null);
    setErrors({});
    setDraft({ categoryId: category.id, input: emptyMenuItemInput() });
  }

  function startEdit(item: MenuItem) {
    setNotice(null);
    setErrors({});
    setDraft({ categoryId: category.id, input: menuItemToInput(item), original: item });
  }

  function update<K extends keyof MenuItemInput>(key: K, value: MenuItemInput[K]) {
    setDraft((d) => (d ? { ...d, input: { ...d.input, [key]: value } } : d));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !draft) return;
    const problem = checkPhotoFile(file);
    if (problem) {
      setErrors((er) => ({ ...er, image: problem }));
      return;
    }
    setPhotoBusy(true);
    try {
      const dataUrl = await downscaleImage(file);
      const url = await uploadOwnerPhoto(ownerToken, dataUrl);
      setDraft((d) =>
        d ? { ...d, input: { ...d.input, image: url, imageSrcSet: undefined, imageIsIllustrative: false } } : d
      );
      setErrors((er) => ({ ...er, image: undefined }));
    } catch (err) {
      setErrors((er) => ({ ...er, image: err instanceof Error ? err.message : 'Upload failed.' }));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    const { item, errors: found } = validateMenuItemInput(draft.input, draft.original);
    if (!item) {
      setErrors(found);
      return;
    }
    const ok = await applyCmsUpdate(upsertMenuItem(cms, draft.categoryId, item));
    if (ok) {
      setCategoryId(draft.categoryId);
      setNotice(`${draft.original ? 'Saved' : 'Added'} "${item.name}". It is ${item.hidden ? 'hidden from' : 'live on'} the menu.`);
      setDraft(null);
    }
  }

  async function removeItem(item: MenuItem) {
    if (!window.confirm(`Delete "${item.name}" from the menu? This cannot be undone.`)) return;
    if (await applyCmsUpdate(deleteMenuItem(cms, item.id))) setNotice(`Deleted "${item.name}".`);
  }

  async function saveSection() {
    if (!sectionDraft) return;
    const { value, errors: found } = validateCategoryText(sectionDraft);
    if (!value) {
      setSectionErrors(found);
      return;
    }
    if (await applyCmsUpdate(updateCategoryText(cms, category.id, value))) {
      setSectionDraft(null);
      setNotice('Section text saved.');
    }
  }

  const input = draft?.input;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Link protection is always on.</strong> Dish names, descriptions and section text
          can&apos;t contain links, web addresses or code. Order links must be on ubereats.com or
          deliveroo.co.uk.
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded-lg bg-[#141413] text-white px-4 py-2.5 text-sm">
          {notice}
        </p>
      )}

      {!draft && (
        <>
          <div role="group" aria-label="Menu section" className="flex flex-wrap gap-2">
            {cms.menuCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={cat.id === category.id}
                onClick={() => {
                  setCategoryId(cat.id);
                  setSectionDraft(null);
                  setNotice(null);
                }}
                className={`min-h-10 px-3.5 text-xs font-semibold rounded-md border transition-colors ${
                  cat.id === category.id
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : 'bg-white text-neutral-700 border-[#D4CFC2] hover:text-[#141413]'
                }`}
              >
                {cat.title} ({cat.items.length})
                {!cat.published && <span className="ml-1 text-amber-600">· draft</span>}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[#E4E0D5] bg-white p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">{category.kicker || 'Menu section'}</p>
                <h3 className="font-display text-2xl font-bold uppercase">{category.title}</h3>
                {!category.published && (
                  <p className="text-xs text-amber-800 mt-1">
                    Draft section — not shown to customers until published in the Drafts tab.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSectionErrors({});
                    setSectionDraft(
                      sectionDraft
                        ? null
                        : { title: category.title, kicker: category.kicker, description: category.description }
                    );
                  }}
                  className="inline-flex items-center gap-1.5 min-h-10 px-3.5 border border-[#D4CFC2] hover:border-[#141413] text-xs font-semibold uppercase tracking-wider rounded-md"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit section text
                </button>
                <button
                  type="button"
                  onClick={startAdd}
                  className="inline-flex items-center gap-1.5 min-h-10 px-4 bg-[#C8281E] hover:bg-[#AD2017] text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add new dish
                </button>
              </div>
            </div>

            {sectionDraft && (
              <div className="grid gap-3 border-t border-[#E4E0D5] pt-4">
                <Field id="section-title" label="Section title" error={sectionErrors.title}>
                  <input
                    id="section-title"
                    className={`${inputClass} ${sectionErrors.title ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                    value={sectionDraft.title}
                    maxLength={60}
                    onChange={(e) => setSectionDraft({ ...sectionDraft, title: e.target.value })}
                  />
                </Field>
                <Field id="section-kicker" label="Small label above the title" error={sectionErrors.kicker}>
                  <input
                    id="section-kicker"
                    className={`${inputClass} ${sectionErrors.kicker ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                    value={sectionDraft.kicker}
                    maxLength={60}
                    onChange={(e) => setSectionDraft({ ...sectionDraft, kicker: e.target.value })}
                  />
                </Field>
                <Field id="section-description" label="Section description" error={sectionErrors.description}>
                  <textarea
                    id="section-description"
                    rows={3}
                    className={`${inputClass} ${sectionErrors.description ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                    value={sectionDraft.description}
                    maxLength={300}
                    onChange={(e) => setSectionDraft({ ...sectionDraft, description: e.target.value })}
                  />
                </Field>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveSection()}
                    className="min-h-10 px-4 bg-[#141413] hover:bg-[#C8281E] disabled:opacity-45 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                  >
                    Save section text
                  </button>
                  <button
                    type="button"
                    onClick={() => setSectionDraft(null)}
                    className="min-h-10 px-4 border border-[#D4CFC2] text-xs font-semibold uppercase tracking-wider rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {category.items.length === 0 ? (
              <p className="text-sm text-neutral-600 border-t border-[#E4E0D5] pt-4">
                No dishes in this section yet. Use &ldquo;Add new dish&rdquo;.
              </p>
            ) : (
              <ul className="divide-y divide-[#E4E0D5] border-t border-[#E4E0D5]">
                {category.items.map((item, index) => (
                  <li key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="w-16 h-12 rounded-md object-cover shrink-0 bg-neutral-200"
                        />
                      ) : (
                        <span className="w-16 h-12 rounded-md shrink-0 bg-[#1E1D1B] inline-flex items-center justify-center">
                          <UtensilsCrossed className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#141413] truncate">
                          {item.name}
                          {item.verifiedPrice && (
                            <span className="ml-2 font-normal text-neutral-600">{item.verifiedPrice}</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 flex flex-wrap gap-x-2">
                          {item.halal && <span className="text-emerald-700 font-semibold">Halal</span>}
                          {item.hidden ? (
                            <span className="text-amber-700 font-semibold">Hidden</span>
                          ) : (
                            <span>Live</span>
                          )}
                          {!item.image && <span>No photo</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={saving || index === 0}
                        onClick={() => void applyCmsUpdate(moveMenuItem(cms, item.id, -1))}
                        aria-label={`Move ${item.name} up`}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-[#D4CFC2] disabled:opacity-35"
                      >
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={saving || index === category.items.length - 1}
                        onClick={() => void applyCmsUpdate(moveMenuItem(cms, item.id, 1))}
                        aria-label={`Move ${item.name} down`}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-[#D4CFC2] disabled:opacity-35"
                      >
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void applyCmsUpdate(setMenuItemHidden(cms, item.id, !item.hidden))}
                        aria-label={`${item.hidden ? 'Show' : 'Hide'} ${item.name}`}
                        className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border border-[#D4CFC2] text-xs font-semibold"
                      >
                        {item.hidden ? (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        )}
                        {item.hidden ? 'Show' : 'Hide'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md bg-[#141413] hover:bg-[#C8281E] text-white text-xs font-semibold"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void removeItem(item)}
                        aria-label={`Delete ${item.name}`}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {draft && input && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveDraft();
          }}
          aria-label={draft.original ? `Edit ${draft.original.name}` : 'Add new dish'}
          className="rounded-xl border border-[#D4CFC2] bg-white p-5 sm:p-6 space-y-5"
          noValidate
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-bold uppercase">
              {draft.original ? `Edit ${draft.original.name}` : 'Add new dish'}
            </h3>
            <button
              type="button"
              onClick={() => setDraft(null)}
              aria-label="Cancel editing"
              className="w-10 h-10 inline-flex items-center justify-center rounded-md hover:bg-neutral-100"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="dish-name" label="Dish name *" error={errors.name}>
              <input
                id="dish-name"
                data-autofocus
                className={`${inputClass} ${errors.name ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                value={input.name}
                maxLength={60}
                onChange={(e) => update('name', e.target.value)}
              />
            </Field>
            <Field id="dish-price" label="Price" hint="e.g. £11.70 or £2.00 – £6.50" error={errors.verifiedPrice}>
              <input
                id="dish-price"
                inputMode="decimal"
                className={`${inputClass} ${errors.verifiedPrice ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                value={input.verifiedPrice}
                maxLength={20}
                onChange={(e) => update('verifiedPrice', e.target.value)}
              />
            </Field>
            <Field
              id="dish-description"
              label="Description *"
              hint={`${input.description.length}/400`}
              error={errors.description}
            >
              <textarea
                id="dish-description"
                rows={4}
                className={`${inputClass} ${errors.description ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                value={input.description}
                maxLength={400}
                onChange={(e) => update('description', e.target.value)}
              />
            </Field>
            <div className="grid gap-4">
              <Field id="dish-kicker" label="Small red label" hint="e.g. a city name" error={errors.cityInspiration}>
                <input
                  id="dish-kicker"
                  className={`${inputClass} ${errors.cityInspiration ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                  value={input.cityInspiration}
                  maxLength={40}
                  onChange={(e) => update('cityInspiration', e.target.value)}
                />
              </Field>
              <Field id="dish-style" label="Bread / style" hint="e.g. Oversized Moroccan Baguette" error={errors.breadOrVessel}>
                <input
                  id="dish-style"
                  className={`${inputClass} ${errors.breadOrVessel ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                  value={input.breadOrVessel}
                  maxLength={60}
                  onChange={(e) => update('breadOrVessel', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[180px_1fr] items-start border-t border-[#E4E0D5] pt-5">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#1E1D1B] flex items-center justify-center">
              {input.image ? (
                <img src={input.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <UtensilsCrossed className="w-8 h-8 text-[#F59E0B]" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 min-h-10 px-4 bg-[#141413] hover:bg-[#C8281E] text-white text-xs font-semibold uppercase tracking-wider rounded-md cursor-pointer">
                  {photoBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ImagePlus className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{input.image ? 'Replace photo' : 'Upload photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void handlePhoto(e)}
                    disabled={photoBusy}
                    className="sr-only"
                    aria-label="Upload dish photo"
                  />
                </label>
                {input.image && (
                  <button
                    type="button"
                    onClick={() => {
                      update('image', '');
                      update('imageSrcSet', undefined);
                    }}
                    className="min-h-10 px-3.5 border border-[#D4CFC2] text-xs font-semibold uppercase tracking-wider rounded-md"
                  >
                    Remove photo
                  </button>
                )}
              </div>
              {errors.image && (
                <p role="alert" className="text-xs text-red-700">
                  {errors.image}
                </p>
              )}
              {!input.image && (
                <p className="text-[11px] text-neutral-500">
                  Without a photo the menu shows a styled name card.
                </p>
              )}
              {input.image && (
                <>
                  <Field id="dish-alt" label="Photo description (for screen readers & Google)" error={errors.imageAlt}>
                    <input
                      id="dish-alt"
                      className={`${inputClass} ${errors.imageAlt ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                      value={input.imageAlt}
                      maxLength={160}
                      onChange={(e) => update('imageAlt', e.target.value)}
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={input.imageIsIllustrative}
                      onChange={(e) => update('imageIsIllustrative', e.target.checked)}
                      className="w-4 h-4 accent-[#C8281E]"
                    />
                    Show &ldquo;Illustrative image&rdquo; label (photo is not the actual dish)
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t border-[#E4E0D5] pt-5">
            <Field id="dish-uber" label="Uber Eats link" hint="Must be on ubereats.com" error={errors.orderUrl}>
              <input
                id="dish-uber"
                type="url"
                className={`${inputClass} ${errors.orderUrl ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                value={input.orderUrl}
                onChange={(e) => update('orderUrl', e.target.value)}
              />
            </Field>
            <Field
              id="dish-deliveroo"
              label="Deliveroo link"
              hint="Must be on deliveroo.co.uk, or leave empty"
              error={errors.deliverooUrl}
            >
              <input
                id="dish-deliveroo"
                type="url"
                className={`${inputClass} ${errors.deliverooUrl ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                value={input.deliverooUrl}
                onChange={(e) => update('deliverooUrl', e.target.value)}
              />
            </Field>
            <Field id="dish-price-note" label="Price note" hint="e.g. Uber Eats" error={errors.priceSourceNote}>
              <input
                id="dish-price-note"
                className={`${inputClass} ${errors.priceSourceNote ? 'border-red-400' : 'border-[#D4CFC2]'}`}
                value={input.priceSourceNote}
                maxLength={60}
                onChange={(e) => update('priceSourceNote', e.target.value)}
              />
            </Field>
            <Field id="dish-section" label="Menu section">
              <select
                id="dish-section"
                className={`${inputClass} border-[#D4CFC2]`}
                value={draft.categoryId}
                onChange={(e) => setDraft({ ...draft, categoryId: e.target.value as MenuCategoryId })}
              >
                {cms.menuCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {categoryLabel(cat)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-[#E4E0D5] pt-5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={input.halal}
                onChange={(e) => update('halal', e.target.checked)}
                className="w-5 h-5 accent-[#1f6b45]"
              />
              Halal tag
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={input.hidden}
                onChange={(e) => update('hidden', e.target.checked)}
                className="w-5 h-5 accent-[#C8281E]"
              />
              Hide from the menu (e.g. sold out)
            </label>
          </div>

          {Object.values(errors).some(Boolean) && (
            <p role="alert" className="text-sm text-red-700">
              Please fix the highlighted fields.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || photoBusy}
              className="inline-flex items-center gap-2 min-h-11 px-6 bg-[#C8281E] hover:bg-[#AD2017] disabled:opacity-45 text-white text-xs font-semibold uppercase tracking-wider rounded-md"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {draft.original ? 'Save changes' : 'Add dish to menu'}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="min-h-11 px-5 border border-[#D4CFC2] text-xs font-semibold uppercase tracking-wider rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
