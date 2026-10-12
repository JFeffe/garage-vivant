// V7.6 formation and rehearsal tuning. Every probability uses the world's seeded RNG.
export const GROUP_RULES = Object.freeze({
  affinity:12,love:25,tension:60,membershipDelay:2880,recruitmentDelay:1440,pairDelay:1440,
  proposal:.315,recruitmentProposal:.12,recruitmentWeight:1.5,decisionMinutes:360,rehearsalChance:.5,fragileRehearsalChance:.75,fragileCoordination:40,invitationMinutes:720,waitMinutes:120,
  departureMinutes:720,departureGrace:4320,lowAttachment:20,departureChance:.08,
  alternativeGap:25,alternativeChance:.15,nearShow:360,arrivalMargin:10,
  absenceThreshold:90,absenceSlope:.02,positiveAffinity:1.2,negativeAffinity:.4,tensionErosion:.0002,
  attachment:{affinity:.3,style:.1,chemistry:.1,reputation:.2,tension:.15},
});
