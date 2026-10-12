// V7.6 formation and rehearsal tuning. Every probability uses the world's seeded RNG.
export const GROUP_RULES = Object.freeze({
  affinity:12,love:25,tension:60,membershipDelay:2880,recruitmentDelay:1440,pairDelay:1440,
  proposal:.315,recruitmentProposal:.12,recruitmentWeight:1.5,decisionMinutes:360,rehearsalChance:.5,fragileRehearsalChance:.75,fragileCoordination:40,invitationMinutes:720,waitMinutes:120,
  departureMinutes:720,departureGrace:4320,lowAttachment:20,departureChance:.08,
  alternativeGap:25,alternativeChance:.15,nearShow:360,arrivalMargin:10,
  absenceThreshold:90,absenceSlope:.02,positiveAffinity:1.2,negativeAffinity:.4,tensionErosion:.0002,
  attachment:{affinity:.3,style:.1,chemistry:.1,reputation:.2,tension:.15},
});

export const NEED_DRAIN = {
  energy: 0.065,
  social: 0.035,
  fun: 0.04,
  expression: 0.05,
};
export const ACTIVITY_EFFECTS = {
  relax: { fun: 0.12, energy: 0.16 },
  social: { fun: 0.35 },
  decadence: {fun:0.5,energy:-0.18},
  practice: { fun: 0.26, energy: -0.055 },
  write: { expression: 0.65, fun: 0.2, energy: -0.03 },
  jam: { expression: 0.7, fun: 0.5, social: 0.6, energy: -0.05 },
};

export const V7_RULES = Object.freeze({
  exchangeMinutes: 15,
  searchMinutes: 30,
  jamSearchMinutes: 90,
  romanticStart: 0.035,
  advanceThreshold: 5,
  coupleThreshold: 40,
  breakupThreshold: 25,
  coupleChance: 0.08,
  breakupChance: 0.15,
});
