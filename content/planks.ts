// The deck: 24 cards curated from research/planks.draft.ts. It's frozen now
// that it's live, because the dealer's split depends on the IDs, parties, topics
// and counter-type flags (spec § 6). Rewording a statement or a quote is safe.
// The comment above each card gives its Desk ID in research/candidates.json.
import type { Plank } from "@/content/schema";

export const PLANKS: Plank[] = [
  // Desk: rnc-2024-3
  {
    "id": "card-01",
    "party": "R",
    "topic": "Taxes and spending",
    "statement": "Eliminate federal income taxes on tips for restaurant and hospitality workers.",
    "quote": "We will eliminate Taxes on Tips for millions of Restaurant and Hospitality Workers, and pursue additional Tax Cuts.",
    "source": {
      "doc": "rnc-2024",
      "section": "2. Make Trump Tax Cuts Permanent and No Tax on Tips",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": false
  },
  // Desk: lp-2024-1
  {
    "id": "card-02",
    "party": "L",
    "topic": "Taxes and spending",
    "statement": "Repeal the federal income tax and abolish the Internal Revenue Service.",
    "quote": "we call for the repeal of the income tax, the abolishment of the Internal Revenue Service and all federal programs and services not required under the U.S. Constitution.",
    "source": {
      "doc": "lp-2024",
      "section": "2.4 Government Finance and Spending",
      "url": "https://lp.org/platform/"
    },
    "counterType": false
  },
  // Desk: rnc-2024-6
  {
    "id": "card-03",
    "party": "R",
    "topic": "Jobs and trade",
    "statement": "Bar companies that move jobs overseas from receiving federal government contracts.",
    "quote": "Republicans will strengthen Buy American and Hire American Policies, banning companies that outsource jobs from doing business with the Federal Government.",
    "source": {
      "doc": "rnc-2024",
      "section": "5. Buy American and Hire American",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": true
  },
  // Desk: dnc-2024-2
  {
    "id": "card-04",
    "party": "D",
    "topic": "Jobs and trade",
    "statement": "Raise the federal minimum wage to at least $15 an hour.",
    "quote": "We'll work to finally raise the federal minimum wage to at least $15-an-hour.",
    "source": {
      "doc": "dnc-2024",
      "section": "FIGHTING POVERTY",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": false
  },
  // Desk: dnc-2024-10
  {
    "id": "card-05",
    "party": "D",
    "topic": "Health care",
    "statement": "Cap insulin costs at $35 a month for all Americans.",
    "quote": "Now, we'll fight to expand that $35 cap to cover everyone, saving millions of Americans with diabetes nearly $1,000 a year.",
    "source": {
      "doc": "dnc-2024",
      "section": "Prescription Drugs",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": false
  },
  // Desk: rnc-2024-9
  {
    "id": "card-06",
    "party": "R",
    "topic": "Health care",
    "statement": "Expand access to prenatal care, birth control and IVF fertility treatments.",
    "quote": "supporting mothers and policies that advance Prenatal Care, access to Birth Control, and IVF (fertility treatments).",
    "source": {
      "doc": "rnc-2024",
      "section": "4. Republicans Will Protect and Defend a Vote of the People, from within the States, on the Issue of Life",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": true
  },
  // Desk: lp-2024-2
  {
    "id": "card-07",
    "party": "L",
    "topic": "Retirement",
    "statement": "Phase out the current Social Security system and replace it with an optional private system.",
    "quote": "Libertarians would phase out the current government-sponsored Social Security system and transition to a private voluntary system.",
    "source": {
      "doc": "lp-2024",
      "section": "2.14 Retirement and Income Security",
      "url": "https://lp.org/platform/"
    },
    "counterType": false
  },
  // Desk: rnc-2024-7
  {
    "id": "card-08",
    "party": "R",
    "topic": "Retirement",
    "statement": "Rule out any cuts to Social Security or Medicare, including raising the retirement age.",
    "quote": "FIGHT FOR AND PROTECT SOCIAL SECURITY AND MEDICARE WITH NO CUTS, INCLUDING NO CHANGES TO THE RETIREMENT AGE",
    "source": {
      "doc": "rnc-2024",
      "section": "PREAMBLE",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": true
  },
  // Desk: lp-2024-7
  {
    "id": "card-09",
    "party": "L",
    "topic": "Immigration",
    "statement": "Allow unrestricted movement of people and capital across national borders.",
    "quote": "Economic freedom demands the unrestricted movement of human as well as financial capital across national borders.",
    "source": {
      "doc": "lp-2024",
      "section": "3.4 Free Trade and Migration",
      "url": "https://lp.org/platform/"
    },
    "counterType": false
  },
  // Desk: rnc-2024-2
  {
    "id": "card-10",
    "party": "R",
    "topic": "Immigration",
    "statement": "Cut federal funding to cities and counties that refuse to transfer arrested immigrants to federal immigration authorities.",
    "quote": "Republicans will cut federal Funding to sanctuary jurisdictions that release dangerous Illegal Alien criminals onto our streets, rather than handing them over to ICE.",
    "source": {
      "doc": "rnc-2024",
      "section": "5. Stop Sanctuary Cities",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": false
  },
  // Desk: dnc-2024-5
  {
    "id": "card-11",
    "party": "D",
    "topic": "Immigration",
    "statement": "Give the president emergency power to expel unlawful border crossers and pause most asylum processing during surges.",
    "quote": "When the system is overwhelmed, the President should have emergency authority to expel migrants who are crossing unlawfully and stop processing asylum claims except for those using a safe and orderly process at Ports of Entry.",
    "source": {
      "doc": "dnc-2024",
      "section": "Temporary Emergency Authority to Shut Down the Border",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": true
  },
  // Desk: lp-2024-3
  {
    "id": "card-12",
    "party": "L",
    "topic": "Crime, policing and drugs",
    "statement": "Abolish qualified immunity so police and prosecutors can be sued for misconduct.",
    "quote": "we support the abolition of qualified immunity so that law enforcement and prosecutors would be held legally accountable for misconduct that leads to wrongful convictions or other acts of injustice.",
    "source": {
      "doc": "lp-2024",
      "section": "1.7 Crime and Justice",
      "url": "https://lp.org/platform/"
    },
    "counterType": true
  },
  // Desk: dnc-2024-6
  {
    "id": "card-13",
    "party": "D",
    "topic": "Crime, policing and drugs",
    "statement": "Fund 100,000 additional police officers and $5 billion for local violence intervention programs.",
    "quote": "That includes funding 100,000 additional police officers for accountable community policing and $5 billion in community violence intervention",
    "source": {
      "doc": "dnc-2024",
      "section": "POLICING & PUBLIC SAFETY",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": true
  },
  // Desk: dnc-2024-9
  {
    "id": "card-14",
    "party": "D",
    "topic": "Guns",
    "statement": "Reinstate the federal ban on certain semi-automatic firearms and large-capacity magazines.",
    "quote": "We will once again ban assault weapons and high-capacity magazines.",
    "source": {
      "doc": "dnc-2024",
      "section": "GUN SAFETY",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": false
  },
  // Desk: lp-2024-6
  {
    "id": "card-15",
    "party": "L",
    "topic": "Guns",
    "statement": "Repeal all laws restricting, registering or monitoring the ownership, manufacture or transfer of firearms.",
    "quote": "We oppose all laws at any level of government restricting, registering, or monitoring the ownership, manufacture, or transfer of firearms, ammunition, or firearm accessories.",
    "source": {
      "doc": "lp-2024",
      "section": "1.9 Self-Defense",
      "url": "https://lp.org/platform/"
    },
    "counterType": false
  },
  // Desk: rnc-2024-11
  {
    "id": "card-16",
    "party": "R",
    "topic": "Education",
    "statement": "Close the federal Department of Education and leave schooling to the states.",
    "quote": "We are going to close the Department of Education in Washington, D.C. and send it back to the States, where it belongs, and let the States run our educational system as it should be run.",
    "source": {
      "doc": "rnc-2024",
      "section": "9. Return Education to the States",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": false
  },
  // Desk: lp-2024-12
  {
    "id": "card-17",
    "party": "L",
    "topic": "Education",
    "statement": "End federal student loan guarantees and let student debt be discharged in bankruptcy.",
    "quote": "We support ending federal student loan guarantees and special treatment of student loan debt in bankruptcy proceedings.",
    "source": {
      "doc": "lp-2024",
      "section": "2.7 Money and Financial Markets",
      "url": "https://lp.org/platform/"
    },
    "counterType": true
  },
  // Desk: lp-2024-8
  {
    "id": "card-18",
    "party": "L",
    "topic": "Defense and foreign policy",
    "statement": "End U.S. military and economic aid abroad, tariffs, economic sanctions and regime change efforts.",
    "quote": "We would end the current U.S. government policies of foreign intervention including military and economic aid; tariffs; economic sanctions; and regime change.",
    "source": {
      "doc": "lp-2024",
      "section": "3.3 International Affairs",
      "url": "https://lp.org/platform/"
    },
    "counterType": false
  },
  // Desk: dnc-2024-8
  {
    "id": "card-19",
    "party": "D",
    "topic": "Defense and foreign policy",
    "statement": "Modernize the land, sea and air legs of the U.S. nuclear weapons arsenal.",
    "quote": "maintained a commitment to modernize and recapitalize the nuclear triad as the bedrock of deterrence",
    "source": {
      "doc": "dnc-2024",
      "section": "STRONGEST MILITARY IN THE WORLD",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": true
  },
  // Desk: rnc-2024-15
  {
    "id": "card-20",
    "party": "R",
    "topic": "Rights and speech",
    "statement": "Ban federal agencies from working with outside groups to remove lawful speech, and cut funding to institutions that do so.",
    "quote": "We will ban the Federal Government from colluding with anyone to censor Lawful Speech, defund institutions engaged in censorship, and hold accountable all bureaucrats involved with illegal censoring.",
    "source": {
      "doc": "rnc-2024",
      "section": "2. Republicans Will Dismantle Censorship & Protect Free Speech",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": false
  },
  // Desk: lp-2024-15
  {
    "id": "card-21",
    "party": "L",
    "topic": "Rights and speech",
    "statement": "Grant marriage licenses to all consenting adults who apply until government stops licensing marriage entirely.",
    "quote": "Until such time as the government stops its illegitimate practice of marriage licensing, such licenses must be granted to all consenting adults who apply.",
    "source": {
      "doc": "lp-2024",
      "section": "1.4 Personal Relationships",
      "url": "https://lp.org/platform/"
    },
    "counterType": true
  },
  // Desk: dnc-2024-14
  {
    "id": "card-22",
    "party": "D",
    "topic": "Rights and speech",
    "statement": "Pass a federal law that restores the abortion rules of Roe v. Wade nationwide.",
    "quote": "With a Democratic Congress, we will pass national legislation to make Roe the law of the land again.",
    "source": {
      "doc": "dnc-2024",
      "section": "REPRODUCTIVE FREEDOM",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": false
  },
  // Desk: dnc-2024-13
  {
    "id": "card-23",
    "party": "D",
    "topic": "Elections and government",
    "statement": "Pass a constitutional amendment banning all private financing of federal election campaigns.",
    "quote": "We will keep super PACs wholly independent of campaigns and parties and pass a constitutional amendment that will ban all private financing from federal elections.",
    "source": {
      "doc": "dnc-2024",
      "section": "STOPPING THE INFLUENCE OF SPECIAL INTERESTS",
      "url": "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform"
    },
    "counterType": false
  },
  // Desk: rnc-2024-14
  {
    "id": "card-24",
    "party": "R",
    "topic": "Elections and government",
    "statement": "Require voter ID and proof of citizenship to vote, and use paper ballots.",
    "quote": "We will implement measures to secure our Elections, including Voter ID, highly sophisticated paper ballots, proof of Citizenship, and same day Voting.",
    "source": {
      "doc": "rnc-2024",
      "section": "6. Republicans Will Ensure Election Integrity",
      "url": "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform"
    },
    "counterType": false
  },
];
