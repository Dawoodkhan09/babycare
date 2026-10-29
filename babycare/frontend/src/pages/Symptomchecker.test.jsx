import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SymptomChecker from "./Symptomchecker";
import { diagnose } from "../api/ai";

const mockNavigate = jest.fn();
// Jest 27 (CRA) react-router v7 ke "exports" resolve nahi karta → virtual mock
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }), { virtual: true });
jest.mock("../api/ai", () => ({ diagnose: jest.fn() }));

const WAIT = { timeout: 3000 };
// Har bot bubble se pehle ~0.55s "typing…" delay hai, poori chat ~5s se zyada leti hai
jest.setTimeout(20000);

const click = async (name) => fireEvent.click(await screen.findByRole("button", { name }, WAIT));

async function multi(...names) {
  for (const name of names) await click(name);
  await click("Next");
}

const OK_RESULT = (extra = {}) => ({
  language: "en", condition: "Teething", condition_key: "Teething", confidence: 93.4,
  low_confidence: false, confidence_note: null, emergency: false, emergency_reasons: [],
  treatment: { homeopathic: "Chamomilla (traditional)", organic: "Cold teething ring, gum massage" },
  homeopathic_warning: null, advice: "See a doctor if…", ...extra,
});

beforeEach(() => {
  diagnose.mockReset();
  mockNavigate.mockReset();
});

test("fever at 0-3 months → emergency + Book a Doctor (red flags none)", async () => {
  diagnose.mockResolvedValue(OK_RESULT({ condition: "Fever", emergency: true, treatment: null,
    emergency_reasons: ["Fever in a baby under 3 months"] }));
  render(<SymptomChecker />);
  await click("Fever");
  await click("0–3 months");
  await click("1–2 days");
  await click("Mild (below 38.5°C / 101°F)");
  await click("Yes, normally");
  await multi("Nothing else");
  await multi("None of these");
  await click("Skip");

  await waitFor(() => expect(diagnose).toHaveBeenCalledTimes(1), WAIT);
  expect(diagnose).toHaveBeenCalledWith({
    symptoms: ["fever"], age: "0-3m", duration: "1-2d", additional: "", language: "en", emergency_hint: false,
  });
  expect(await screen.findByText("Possible emergency", {}, WAIT)).toBeInTheDocument();
  expect(screen.queryByText("Organic / Home care")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Book a Doctor" }));
  expect(mockNavigate).toHaveBeenCalledWith("/DoctorBooking");
});

test("diarrhea → many → dehydration → emergency_hint true", async () => {
  diagnose.mockResolvedValue(OK_RESULT({ condition: "Diarrhea", emergency: true, treatment: null }));
  render(<SymptomChecker />);
  await click("Diarrhea / loose stools");
  await click("3–12 months");
  await click("1–2 days");
  await click("Many (4 or more)");
  await multi("Dehydration (dry mouth, no tears, little urine)");
  await multi("None of these");
  await click("Skip");

  await waitFor(() => expect(diagnose).toHaveBeenCalled(), WAIT);
  expect(diagnose.mock.calls[0][0]).toMatchObject({ symptoms: ["diarrhea"], age: "3-12m", emergency_hint: true });
  expect(await screen.findByRole("button", { name: "Book a Doctor" }, WAIT)).toBeInTheDocument();
});

test("teething → drooling → no fever → result with FDA warning, no homeopathic card", async () => {
  diagnose.mockResolvedValue(OK_RESULT({ homeopathic_warning: "FDA WARNING: do not use homeopathic teething tablets" }));
  render(<SymptomChecker />);
  await click("Teething");
  await click("3–12 months");
  await click("3–5 days");
  await multi("Drooling");
  await click("No");
  await multi("None of these");
  await click("Skip");

  await waitFor(() => expect(diagnose).toHaveBeenCalled(), WAIT);
  expect(diagnose.mock.calls[0][0]).toMatchObject({ symptoms: ["teething_pain"], emergency_hint: false });
  expect(await screen.findByText(/FDA WARNING/, {}, WAIT)).toBeInTheDocument();
  expect(screen.queryByText("Homeopathic")).not.toBeInTheDocument();
  expect(screen.getByText("Cold teething ring, gum massage")).toBeInTheDocument();
  expect(screen.getByText(/not a replacement for a real doctor/)).toBeInTheDocument();
});

test("cold & cough → dry → no fever, typed notes are sent", async () => {
  diagnose.mockResolvedValue(OK_RESULT({ condition: "Cold & Cough" }));
  render(<SymptomChecker />);
  await click("Cold & Cough");
  await click("1–3 years");
  await click("3–5 days");
  await click("Dry cough");
  await click("No fever");
  await multi("None of these");
  fireEvent.change(await screen.findByPlaceholderText("Type here…", {}, WAIT), { target: { value: "raat ko zyada" } });
  await click("Send");

  await waitFor(() => expect(diagnose).toHaveBeenCalled(), WAIT);
  expect(diagnose.mock.calls[0][0]).toEqual({
    symptoms: ["cold_cough"], age: "1-3y", duration: "3-5d", additional: "raat ko zyada",
    language: "en", emergency_hint: false,
  });
  expect(await screen.findByText("Cold & Cough", { selector: "span" }, WAIT)).toBeInTheDocument();
});

test("Urdu: whole chat switches language and language is sent", async () => {
  diagnose.mockResolvedValue(OK_RESULT({ language: "ur" }));
  render(<SymptomChecker />);
  fireEvent.click(screen.getByRole("button", { name: "اردو" }));
  expect(await screen.findByText("آپ کے بچے کو سب سے بڑا مسئلہ کیا ہے؟", {}, WAIT)).toBeInTheDocument();
  await click("دانت نکلنا");
  expect(await screen.findByText("آپ کے بچے کی عمر کتنی ہے؟", {}, WAIT)).toBeInTheDocument();
  expect(screen.getByText("سوال 2/7")).toBeInTheDocument();
  await click("3–12 ماہ");
  await click("1–2 دن");
  await click("رال ٹپکنا");
  await click("آگے");
  await click("نہیں");
  await click("ان میں سے کوئی نہیں");
  await click("آگے");
  await click("چھوڑ دیں");
  await waitFor(() => expect(diagnose).toHaveBeenCalled(), WAIT);
  expect(diagnose.mock.calls[0][0].language).toBe("ur");
});

test("freetext main complaint goes straight to red flags; restart resets", async () => {
  diagnose.mockResolvedValue(OK_RESULT());
  render(<SymptomChecker />);
  fireEvent.change(await screen.findByPlaceholderText("Or type your answer…", {}, WAIT),
    { target: { value: "bachay ko khansi hai" } });
  await click("Send");
  await click("1–3 years");
  await click("Since today");
  expect(await screen.findByText(/danger signs/, {}, WAIT)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Restart" }));
  expect(screen.queryByText("bachay ko khansi hai")).not.toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Fever" }, WAIT)).toBeInTheDocument();
});
