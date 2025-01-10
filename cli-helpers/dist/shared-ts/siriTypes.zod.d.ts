import { z } from "zod";
import { DayType, EnvironmentReason, EquipmentReason, MiscellaneousReason, PersonnelReason, Progress, Severity, SourceType, VehicleMode } from "./enums";
export declare const sourceTypeSchema: z.ZodNativeEnum<typeof SourceType>;
export declare const progressSchema: z.ZodNativeEnum<typeof Progress>;
export declare const miscellaneousReasonSchema: z.ZodNativeEnum<typeof MiscellaneousReason>;
export declare const personnelReasonSchema: z.ZodNativeEnum<typeof PersonnelReason>;
export declare const equipmentReasonSchema: z.ZodNativeEnum<typeof EquipmentReason>;
export declare const environmentReasonSchema: z.ZodNativeEnum<typeof EnvironmentReason>;
export declare const dayTypeSchema: z.ZodNativeEnum<typeof DayType>;
export declare const sourceSchema: z.ZodObject<{
    SourceType: z.ZodNativeEnum<typeof SourceType>;
    TimeOfCommunication: z.ZodString;
}, "strip", z.ZodTypeAny, {
    SourceType: SourceType;
    TimeOfCommunication: string;
}, {
    SourceType: SourceType;
    TimeOfCommunication: string;
}>;
export declare const periodSchema: z.ZodEffects<z.ZodObject<{
    StartTime: z.ZodString;
    EndTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    StartTime: string;
    EndTime?: string | undefined;
}, {
    StartTime: string;
    EndTime?: string | undefined;
}>, {
    StartTime: string;
    EndTime?: string | undefined;
}, {
    StartTime: string;
    EndTime?: string | undefined;
}>;
export declare const infoLinkSchema: z.ZodObject<{
    Uri: z.ZodString;
}, "strip", z.ZodTypeAny, {
    Uri: string;
}, {
    Uri: string;
}>;
export declare const situationElementRefSchema: z.ZodObject<{
    CreationTime: z.ZodOptional<z.ZodString>;
    VersionedAtTime: z.ZodOptional<z.ZodString>;
    ParticipantRef: z.ZodString;
    SituationNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ParticipantRef: string;
    SituationNumber: string;
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
}, {
    ParticipantRef: string;
    SituationNumber: string;
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
}>;
export declare const referenceSchema: z.ZodObject<{
    RelatedToRef: z.ZodArray<z.ZodObject<{
        CreationTime: z.ZodOptional<z.ZodString>;
        VersionedAtTime: z.ZodOptional<z.ZodString>;
        ParticipantRef: z.ZodString;
        SituationNumber: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ParticipantRef: string;
        SituationNumber: string;
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
    }, {
        ParticipantRef: string;
        SituationNumber: string;
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    RelatedToRef: {
        ParticipantRef: string;
        SituationNumber: string;
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
    }[];
}, {
    RelatedToRef: {
        ParticipantRef: string;
        SituationNumber: string;
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
    }[];
}>;
export declare const repetitionsSchema: z.ZodObject<{
    DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
}, "strip", z.ZodTypeAny, {
    DayType: DayType[];
}, {
    DayType: DayType[];
}>;
export declare const infoLinksSchema: z.ZodObject<{
    InfoLink: z.ZodArray<z.ZodObject<{
        Uri: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        Uri: string;
    }, {
        Uri: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    InfoLink: {
        Uri: string;
    }[];
}, {
    InfoLink: {
        Uri: string;
    }[];
}>;
export declare const affectedOperatorSchema: z.ZodObject<{
    OperatorRef: z.ZodString;
    OperatorName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    OperatorRef: string;
    OperatorName?: string | undefined;
}, {
    OperatorRef: string;
    OperatorName?: string | undefined;
}>;
export declare const operatorsSchema: z.ZodObject<{
    AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
    AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
        OperatorRef: z.ZodString;
        OperatorName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        OperatorRef: string;
        OperatorName?: string | undefined;
    }, {
        OperatorRef: string;
        OperatorName?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    AllOperators?: "" | undefined;
    AffectedOperator?: {
        OperatorRef: string;
        OperatorName?: string | undefined;
    }[] | undefined;
}, {
    AllOperators?: "" | undefined;
    AffectedOperator?: {
        OperatorRef: string;
        OperatorName?: string | undefined;
    }[] | undefined;
}>;
export declare const networksSchema: z.ZodObject<{
    AffectedNetwork: z.ZodObject<{
        VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
        AllLines: z.ZodOptional<z.ZodLiteral<"">>;
        AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
            AffectedOperator: z.ZodOptional<z.ZodObject<{
                OperatorRef: z.ZodString;
                OperatorName: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                OperatorRef: string;
                OperatorName?: string | undefined;
            }, {
                OperatorRef: string;
                OperatorName?: string | undefined;
            }>>;
            LineRef: z.ZodString;
            PublishedLineName: z.ZodString;
            Direction: z.ZodOptional<z.ZodObject<{
                DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
            }, "strip", z.ZodTypeAny, {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            }, {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            }>>;
        }, "strip", z.ZodTypeAny, {
            LineRef: string;
            PublishedLineName: string;
            AffectedOperator?: {
                OperatorRef: string;
                OperatorName?: string | undefined;
            } | undefined;
            Direction?: {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            } | undefined;
        }, {
            LineRef: string;
            PublishedLineName: string;
            AffectedOperator?: {
                OperatorRef: string;
                OperatorName?: string | undefined;
            } | undefined;
            Direction?: {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            } | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        VehicleMode: VehicleMode;
        AllLines?: "" | undefined;
        AffectedLine?: {
            LineRef: string;
            PublishedLineName: string;
            AffectedOperator?: {
                OperatorRef: string;
                OperatorName?: string | undefined;
            } | undefined;
            Direction?: {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            } | undefined;
        }[] | undefined;
    }, {
        VehicleMode: VehicleMode;
        AllLines?: "" | undefined;
        AffectedLine?: {
            LineRef: string;
            PublishedLineName: string;
            AffectedOperator?: {
                OperatorRef: string;
                OperatorName?: string | undefined;
            } | undefined;
            Direction?: {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            } | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    AffectedNetwork: {
        VehicleMode: VehicleMode;
        AllLines?: "" | undefined;
        AffectedLine?: {
            LineRef: string;
            PublishedLineName: string;
            AffectedOperator?: {
                OperatorRef: string;
                OperatorName?: string | undefined;
            } | undefined;
            Direction?: {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            } | undefined;
        }[] | undefined;
    };
}, {
    AffectedNetwork: {
        VehicleMode: VehicleMode;
        AllLines?: "" | undefined;
        AffectedLine?: {
            LineRef: string;
            PublishedLineName: string;
            AffectedOperator?: {
                OperatorRef: string;
                OperatorName?: string | undefined;
            } | undefined;
            Direction?: {
                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
            } | undefined;
        }[] | undefined;
    };
}>;
export declare const placesSchema: z.ZodObject<{
    AffectedPlace: z.ZodArray<z.ZodObject<{
        PlaceRef: z.ZodString;
        PlaceName: z.ZodString;
        PlaceCategory: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        PlaceRef: string;
        PlaceName: string;
        PlaceCategory: string;
    }, {
        PlaceRef: string;
        PlaceName: string;
        PlaceCategory: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    AffectedPlace: {
        PlaceRef: string;
        PlaceName: string;
        PlaceCategory: string;
    }[];
}, {
    AffectedPlace: {
        PlaceRef: string;
        PlaceName: string;
        PlaceCategory: string;
    }[];
}>;
export declare const stopPointsSchema: z.ZodObject<{
    AffectedStopPoint: z.ZodArray<z.ZodObject<{
        StopPointRef: z.ZodString;
        StopPointName: z.ZodString;
        Location: z.ZodObject<{
            Longitude: z.ZodNumber;
            Latitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            Longitude: number;
            Latitude: number;
        }, {
            Longitude: number;
            Latitude: number;
        }>;
        AffectedModes: z.ZodObject<{
            Mode: z.ZodObject<{
                VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
            }, "strip", z.ZodTypeAny, {
                VehicleMode: VehicleMode;
            }, {
                VehicleMode: VehicleMode;
            }>;
        }, "strip", z.ZodTypeAny, {
            Mode: {
                VehicleMode: VehicleMode;
            };
        }, {
            Mode: {
                VehicleMode: VehicleMode;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        StopPointRef: string;
        StopPointName: string;
        Location: {
            Longitude: number;
            Latitude: number;
        };
        AffectedModes: {
            Mode: {
                VehicleMode: VehicleMode;
            };
        };
    }, {
        StopPointRef: string;
        StopPointName: string;
        Location: {
            Longitude: number;
            Latitude: number;
        };
        AffectedModes: {
            Mode: {
                VehicleMode: VehicleMode;
            };
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    AffectedStopPoint: {
        StopPointRef: string;
        StopPointName: string;
        Location: {
            Longitude: number;
            Latitude: number;
        };
        AffectedModes: {
            Mode: {
                VehicleMode: VehicleMode;
            };
        };
    }[];
}, {
    AffectedStopPoint: {
        StopPointRef: string;
        StopPointName: string;
        Location: {
            Longitude: number;
            Latitude: number;
        };
        AffectedModes: {
            Mode: {
                VehicleMode: VehicleMode;
            };
        };
    }[];
}>;
export declare const journeysSchema: z.ZodObject<{
    AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
        VehicleJourneyRef: z.ZodString;
        Route: z.ZodString;
        OriginAimedDepartureTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        VehicleJourneyRef: string;
        Route: string;
        OriginAimedDepartureTime: string;
    }, {
        VehicleJourneyRef: string;
        Route: string;
        OriginAimedDepartureTime: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    AffectedVehicleJourney: {
        VehicleJourneyRef: string;
        Route: string;
        OriginAimedDepartureTime: string;
    }[];
}, {
    AffectedVehicleJourney: {
        VehicleJourneyRef: string;
        Route: string;
        OriginAimedDepartureTime: string;
    }[];
}>;
export declare const consequenceSchema: z.ZodObject<{
    Consequence: z.ZodArray<z.ZodObject<{
        Condition: z.ZodEnum<["unknown", "cancelled"]>;
        Severity: z.ZodNativeEnum<typeof Severity>;
        Affects: z.ZodObject<{
            Operators: z.ZodOptional<z.ZodObject<{
                AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
                AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    OperatorRef: z.ZodString;
                    OperatorName: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }, {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            }, {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            }>>;
            Networks: z.ZodOptional<z.ZodObject<{
                AffectedNetwork: z.ZodObject<{
                    VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                    AllLines: z.ZodOptional<z.ZodLiteral<"">>;
                    AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        AffectedOperator: z.ZodOptional<z.ZodObject<{
                            OperatorRef: z.ZodString;
                            OperatorName: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }, {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }>>;
                        LineRef: z.ZodString;
                        PublishedLineName: z.ZodString;
                        Direction: z.ZodOptional<z.ZodObject<{
                            DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
                        }, "strip", z.ZodTypeAny, {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        }, {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        }>>;
                    }, "strip", z.ZodTypeAny, {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }, {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                }, {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            }, {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            }>>;
            Places: z.ZodOptional<z.ZodObject<{
                AffectedPlace: z.ZodArray<z.ZodObject<{
                    PlaceRef: z.ZodString;
                    PlaceName: z.ZodString;
                    PlaceCategory: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }, {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            }, {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            }>>;
            StopPoints: z.ZodOptional<z.ZodObject<{
                AffectedStopPoint: z.ZodArray<z.ZodObject<{
                    StopPointRef: z.ZodString;
                    StopPointName: z.ZodString;
                    Location: z.ZodObject<{
                        Longitude: z.ZodNumber;
                        Latitude: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        Longitude: number;
                        Latitude: number;
                    }, {
                        Longitude: number;
                        Latitude: number;
                    }>;
                    AffectedModes: z.ZodObject<{
                        Mode: z.ZodObject<{
                            VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                        }, "strip", z.ZodTypeAny, {
                            VehicleMode: VehicleMode;
                        }, {
                            VehicleMode: VehicleMode;
                        }>;
                    }, "strip", z.ZodTypeAny, {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    }, {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    }>;
                }, "strip", z.ZodTypeAny, {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }, {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            }, {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            }>>;
            VehicleJourneys: z.ZodOptional<z.ZodObject<{
                AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
                    VehicleJourneyRef: z.ZodString;
                    Route: z.ZodString;
                    OriginAimedDepartureTime: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }, {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            }, {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            }>>;
        }, "strip", z.ZodTypeAny, {
            Operators?: {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            } | undefined;
            Networks?: {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            } | undefined;
            Places?: {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            } | undefined;
            StopPoints?: {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            } | undefined;
            VehicleJourneys?: {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            } | undefined;
        }, {
            Operators?: {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            } | undefined;
            Networks?: {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            } | undefined;
            Places?: {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            } | undefined;
            StopPoints?: {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            } | undefined;
            VehicleJourneys?: {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            } | undefined;
        }>;
        Advice: z.ZodObject<{
            Details: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            Details: string;
        }, {
            Details: string;
        }>;
        Blocking: z.ZodObject<{
            JourneyPlanner: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            JourneyPlanner: boolean;
        }, {
            JourneyPlanner: boolean;
        }>;
        Delays: z.ZodOptional<z.ZodObject<{
            Delay: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            Delay: string;
        }, {
            Delay: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        Condition: "unknown" | "cancelled";
        Severity: Severity;
        Affects: {
            Operators?: {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            } | undefined;
            Networks?: {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            } | undefined;
            Places?: {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            } | undefined;
            StopPoints?: {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            } | undefined;
            VehicleJourneys?: {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            } | undefined;
        };
        Advice: {
            Details: string;
        };
        Blocking: {
            JourneyPlanner: boolean;
        };
        Delays?: {
            Delay: string;
        } | undefined;
    }, {
        Condition: "unknown" | "cancelled";
        Severity: Severity;
        Affects: {
            Operators?: {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            } | undefined;
            Networks?: {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            } | undefined;
            Places?: {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            } | undefined;
            StopPoints?: {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            } | undefined;
            VehicleJourneys?: {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            } | undefined;
        };
        Advice: {
            Details: string;
        };
        Blocking: {
            JourneyPlanner: boolean;
        };
        Delays?: {
            Delay: string;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    Consequence: {
        Condition: "unknown" | "cancelled";
        Severity: Severity;
        Affects: {
            Operators?: {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            } | undefined;
            Networks?: {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            } | undefined;
            Places?: {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            } | undefined;
            StopPoints?: {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            } | undefined;
            VehicleJourneys?: {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            } | undefined;
        };
        Advice: {
            Details: string;
        };
        Blocking: {
            JourneyPlanner: boolean;
        };
        Delays?: {
            Delay: string;
        } | undefined;
    }[];
}, {
    Consequence: {
        Condition: "unknown" | "cancelled";
        Severity: Severity;
        Affects: {
            Operators?: {
                AllOperators?: "" | undefined;
                AffectedOperator?: {
                    OperatorRef: string;
                    OperatorName?: string | undefined;
                }[] | undefined;
            } | undefined;
            Networks?: {
                AffectedNetwork: {
                    VehicleMode: VehicleMode;
                    AllLines?: "" | undefined;
                    AffectedLine?: {
                        LineRef: string;
                        PublishedLineName: string;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        } | undefined;
                        Direction?: {
                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                        } | undefined;
                    }[] | undefined;
                };
            } | undefined;
            Places?: {
                AffectedPlace: {
                    PlaceRef: string;
                    PlaceName: string;
                    PlaceCategory: string;
                }[];
            } | undefined;
            StopPoints?: {
                AffectedStopPoint: {
                    StopPointRef: string;
                    StopPointName: string;
                    Location: {
                        Longitude: number;
                        Latitude: number;
                    };
                    AffectedModes: {
                        Mode: {
                            VehicleMode: VehicleMode;
                        };
                    };
                }[];
            } | undefined;
            VehicleJourneys?: {
                AffectedVehicleJourney: {
                    VehicleJourneyRef: string;
                    Route: string;
                    OriginAimedDepartureTime: string;
                }[];
            } | undefined;
        };
        Advice: {
            Details: string;
        };
        Blocking: {
            JourneyPlanner: boolean;
        };
        Delays?: {
            Delay: string;
        } | undefined;
    }[];
}>;
export declare const basePtSituationElementSchema: z.ZodObject<{
    CreationTime: z.ZodOptional<z.ZodString>;
    ParticipantRef: z.ZodString;
    SituationNumber: z.ZodString;
    Version: z.ZodOptional<z.ZodNumber>;
    References: z.ZodOptional<z.ZodObject<{
        RelatedToRef: z.ZodArray<z.ZodObject<{
            CreationTime: z.ZodOptional<z.ZodString>;
            VersionedAtTime: z.ZodOptional<z.ZodString>;
            ParticipantRef: z.ZodString;
            SituationNumber: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }, {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    }, {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    }>>;
    Source: z.ZodObject<{
        SourceType: z.ZodNativeEnum<typeof SourceType>;
        TimeOfCommunication: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        SourceType: SourceType;
        TimeOfCommunication: string;
    }, {
        SourceType: SourceType;
        TimeOfCommunication: string;
    }>;
    VersionedAtTime: z.ZodOptional<z.ZodString>;
    Progress: z.ZodNativeEnum<typeof Progress>;
    ValidityPeriod: z.ZodArray<z.ZodEffects<z.ZodObject<{
        StartTime: z.ZodString;
        EndTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, "many">;
    Repetitions: z.ZodOptional<z.ZodObject<{
        DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
    }, "strip", z.ZodTypeAny, {
        DayType: DayType[];
    }, {
        DayType: DayType[];
    }>>;
    PublicationWindow: z.ZodEffects<z.ZodObject<{
        StartTime: z.ZodString;
        EndTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
}, {
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
}>;
export declare const ptSituationElementSchema: z.ZodIntersection<z.ZodObject<{
    CreationTime: z.ZodOptional<z.ZodString>;
    ParticipantRef: z.ZodString;
    SituationNumber: z.ZodString;
    Version: z.ZodOptional<z.ZodNumber>;
    References: z.ZodOptional<z.ZodObject<{
        RelatedToRef: z.ZodArray<z.ZodObject<{
            CreationTime: z.ZodOptional<z.ZodString>;
            VersionedAtTime: z.ZodOptional<z.ZodString>;
            ParticipantRef: z.ZodString;
            SituationNumber: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }, {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    }, {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    }>>;
    Source: z.ZodObject<{
        SourceType: z.ZodNativeEnum<typeof SourceType>;
        TimeOfCommunication: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        SourceType: SourceType;
        TimeOfCommunication: string;
    }, {
        SourceType: SourceType;
        TimeOfCommunication: string;
    }>;
    VersionedAtTime: z.ZodOptional<z.ZodString>;
    Progress: z.ZodNativeEnum<typeof Progress>;
    ValidityPeriod: z.ZodArray<z.ZodEffects<z.ZodObject<{
        StartTime: z.ZodString;
        EndTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, "many">;
    Repetitions: z.ZodOptional<z.ZodObject<{
        DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
    }, "strip", z.ZodTypeAny, {
        DayType: DayType[];
    }, {
        DayType: DayType[];
    }>>;
    PublicationWindow: z.ZodEffects<z.ZodObject<{
        StartTime: z.ZodString;
        EndTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
}, {
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
}>, z.ZodIntersection<z.ZodDiscriminatedUnion<"ReasonType", [z.ZodObject<{
    ReasonType: z.ZodLiteral<"MiscellaneousReason">;
    MiscellaneousReason: z.ZodNativeEnum<typeof MiscellaneousReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "MiscellaneousReason";
    MiscellaneousReason: MiscellaneousReason;
}, {
    ReasonType: "MiscellaneousReason";
    MiscellaneousReason: MiscellaneousReason;
}>, z.ZodObject<{
    ReasonType: z.ZodLiteral<"PersonnelReason">;
    PersonnelReason: z.ZodNativeEnum<typeof PersonnelReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "PersonnelReason";
    PersonnelReason: PersonnelReason;
}, {
    ReasonType: "PersonnelReason";
    PersonnelReason: PersonnelReason;
}>, z.ZodObject<{
    ReasonType: z.ZodLiteral<"EquipmentReason">;
    EquipmentReason: z.ZodNativeEnum<typeof EquipmentReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "EquipmentReason";
    EquipmentReason: EquipmentReason;
}, {
    ReasonType: "EquipmentReason";
    EquipmentReason: EquipmentReason;
}>, z.ZodObject<{
    ReasonType: z.ZodLiteral<"EnvironmentReason">;
    EnvironmentReason: z.ZodNativeEnum<typeof EnvironmentReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "EnvironmentReason";
    EnvironmentReason: EnvironmentReason;
}, {
    ReasonType: "EnvironmentReason";
    EnvironmentReason: EnvironmentReason;
}>]>, z.ZodObject<{
    Planned: z.ZodBoolean;
    Summary: z.ZodString;
    Description: z.ZodString;
    InfoLinks: z.ZodOptional<z.ZodObject<{
        InfoLink: z.ZodArray<z.ZodObject<{
            Uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            Uri: string;
        }, {
            Uri: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        InfoLink: {
            Uri: string;
        }[];
    }, {
        InfoLink: {
            Uri: string;
        }[];
    }>>;
    Consequences: z.ZodOptional<z.ZodObject<{
        Consequence: z.ZodArray<z.ZodObject<{
            Condition: z.ZodEnum<["unknown", "cancelled"]>;
            Severity: z.ZodNativeEnum<typeof Severity>;
            Affects: z.ZodObject<{
                Operators: z.ZodOptional<z.ZodObject<{
                    AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
                    AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        OperatorRef: z.ZodString;
                        OperatorName: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }, {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                }, {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                }>>;
                Networks: z.ZodOptional<z.ZodObject<{
                    AffectedNetwork: z.ZodObject<{
                        VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                        AllLines: z.ZodOptional<z.ZodLiteral<"">>;
                        AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            AffectedOperator: z.ZodOptional<z.ZodObject<{
                                OperatorRef: z.ZodString;
                                OperatorName: z.ZodOptional<z.ZodString>;
                            }, "strip", z.ZodTypeAny, {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }, {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }>>;
                            LineRef: z.ZodString;
                            PublishedLineName: z.ZodString;
                            Direction: z.ZodOptional<z.ZodObject<{
                                DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
                            }, "strip", z.ZodTypeAny, {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            }, {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            }>>;
                        }, "strip", z.ZodTypeAny, {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }, {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }>, "many">>;
                    }, "strip", z.ZodTypeAny, {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    }, {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                }, {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                }>>;
                Places: z.ZodOptional<z.ZodObject<{
                    AffectedPlace: z.ZodArray<z.ZodObject<{
                        PlaceRef: z.ZodString;
                        PlaceName: z.ZodString;
                        PlaceCategory: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }, {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                }, {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                }>>;
                StopPoints: z.ZodOptional<z.ZodObject<{
                    AffectedStopPoint: z.ZodArray<z.ZodObject<{
                        StopPointRef: z.ZodString;
                        StopPointName: z.ZodString;
                        Location: z.ZodObject<{
                            Longitude: z.ZodNumber;
                            Latitude: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            Longitude: number;
                            Latitude: number;
                        }, {
                            Longitude: number;
                            Latitude: number;
                        }>;
                        AffectedModes: z.ZodObject<{
                            Mode: z.ZodObject<{
                                VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                            }, "strip", z.ZodTypeAny, {
                                VehicleMode: VehicleMode;
                            }, {
                                VehicleMode: VehicleMode;
                            }>;
                        }, "strip", z.ZodTypeAny, {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        }, {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        }>;
                    }, "strip", z.ZodTypeAny, {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }, {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                }, {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                }>>;
                VehicleJourneys: z.ZodOptional<z.ZodObject<{
                    AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
                        VehicleJourneyRef: z.ZodString;
                        Route: z.ZodString;
                        OriginAimedDepartureTime: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }, {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                }, {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                }>>;
            }, "strip", z.ZodTypeAny, {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            }, {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            }>;
            Advice: z.ZodObject<{
                Details: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                Details: string;
            }, {
                Details: string;
            }>;
            Blocking: z.ZodObject<{
                JourneyPlanner: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                JourneyPlanner: boolean;
            }, {
                JourneyPlanner: boolean;
            }>;
            Delays: z.ZodOptional<z.ZodObject<{
                Delay: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                Delay: string;
            }, {
                Delay: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }, {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    }, {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}, {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}>>>;
export declare const ptSituationElementSchemaWithTransform: z.ZodEffects<z.ZodIntersection<z.ZodObject<{
    CreationTime: z.ZodOptional<z.ZodString>;
    ParticipantRef: z.ZodString;
    SituationNumber: z.ZodString;
    Version: z.ZodOptional<z.ZodNumber>;
    References: z.ZodOptional<z.ZodObject<{
        RelatedToRef: z.ZodArray<z.ZodObject<{
            CreationTime: z.ZodOptional<z.ZodString>;
            VersionedAtTime: z.ZodOptional<z.ZodString>;
            ParticipantRef: z.ZodString;
            SituationNumber: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }, {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    }, {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    }>>;
    Source: z.ZodObject<{
        SourceType: z.ZodNativeEnum<typeof SourceType>;
        TimeOfCommunication: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        SourceType: SourceType;
        TimeOfCommunication: string;
    }, {
        SourceType: SourceType;
        TimeOfCommunication: string;
    }>;
    VersionedAtTime: z.ZodOptional<z.ZodString>;
    Progress: z.ZodNativeEnum<typeof Progress>;
    ValidityPeriod: z.ZodArray<z.ZodEffects<z.ZodObject<{
        StartTime: z.ZodString;
        EndTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, "many">;
    Repetitions: z.ZodOptional<z.ZodObject<{
        DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
    }, "strip", z.ZodTypeAny, {
        DayType: DayType[];
    }, {
        DayType: DayType[];
    }>>;
    PublicationWindow: z.ZodEffects<z.ZodObject<{
        StartTime: z.ZodString;
        EndTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>, {
        StartTime: string;
        EndTime?: string | undefined;
    }, {
        StartTime: string;
        EndTime?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
}, {
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
}>, z.ZodIntersection<z.ZodDiscriminatedUnion<"ReasonType", [z.ZodObject<{
    ReasonType: z.ZodLiteral<"MiscellaneousReason">;
    MiscellaneousReason: z.ZodNativeEnum<typeof MiscellaneousReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "MiscellaneousReason";
    MiscellaneousReason: MiscellaneousReason;
}, {
    ReasonType: "MiscellaneousReason";
    MiscellaneousReason: MiscellaneousReason;
}>, z.ZodObject<{
    ReasonType: z.ZodLiteral<"PersonnelReason">;
    PersonnelReason: z.ZodNativeEnum<typeof PersonnelReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "PersonnelReason";
    PersonnelReason: PersonnelReason;
}, {
    ReasonType: "PersonnelReason";
    PersonnelReason: PersonnelReason;
}>, z.ZodObject<{
    ReasonType: z.ZodLiteral<"EquipmentReason">;
    EquipmentReason: z.ZodNativeEnum<typeof EquipmentReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "EquipmentReason";
    EquipmentReason: EquipmentReason;
}, {
    ReasonType: "EquipmentReason";
    EquipmentReason: EquipmentReason;
}>, z.ZodObject<{
    ReasonType: z.ZodLiteral<"EnvironmentReason">;
    EnvironmentReason: z.ZodNativeEnum<typeof EnvironmentReason>;
}, "strip", z.ZodTypeAny, {
    ReasonType: "EnvironmentReason";
    EnvironmentReason: EnvironmentReason;
}, {
    ReasonType: "EnvironmentReason";
    EnvironmentReason: EnvironmentReason;
}>]>, z.ZodObject<{
    Planned: z.ZodBoolean;
    Summary: z.ZodString;
    Description: z.ZodString;
    InfoLinks: z.ZodOptional<z.ZodObject<{
        InfoLink: z.ZodArray<z.ZodObject<{
            Uri: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            Uri: string;
        }, {
            Uri: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        InfoLink: {
            Uri: string;
        }[];
    }, {
        InfoLink: {
            Uri: string;
        }[];
    }>>;
    Consequences: z.ZodOptional<z.ZodObject<{
        Consequence: z.ZodArray<z.ZodObject<{
            Condition: z.ZodEnum<["unknown", "cancelled"]>;
            Severity: z.ZodNativeEnum<typeof Severity>;
            Affects: z.ZodObject<{
                Operators: z.ZodOptional<z.ZodObject<{
                    AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
                    AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        OperatorRef: z.ZodString;
                        OperatorName: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }, {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                }, {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                }>>;
                Networks: z.ZodOptional<z.ZodObject<{
                    AffectedNetwork: z.ZodObject<{
                        VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                        AllLines: z.ZodOptional<z.ZodLiteral<"">>;
                        AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            AffectedOperator: z.ZodOptional<z.ZodObject<{
                                OperatorRef: z.ZodString;
                                OperatorName: z.ZodOptional<z.ZodString>;
                            }, "strip", z.ZodTypeAny, {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }, {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }>>;
                            LineRef: z.ZodString;
                            PublishedLineName: z.ZodString;
                            Direction: z.ZodOptional<z.ZodObject<{
                                DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
                            }, "strip", z.ZodTypeAny, {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            }, {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            }>>;
                        }, "strip", z.ZodTypeAny, {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }, {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }>, "many">>;
                    }, "strip", z.ZodTypeAny, {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    }, {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                }, {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                }>>;
                Places: z.ZodOptional<z.ZodObject<{
                    AffectedPlace: z.ZodArray<z.ZodObject<{
                        PlaceRef: z.ZodString;
                        PlaceName: z.ZodString;
                        PlaceCategory: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }, {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                }, {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                }>>;
                StopPoints: z.ZodOptional<z.ZodObject<{
                    AffectedStopPoint: z.ZodArray<z.ZodObject<{
                        StopPointRef: z.ZodString;
                        StopPointName: z.ZodString;
                        Location: z.ZodObject<{
                            Longitude: z.ZodNumber;
                            Latitude: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            Longitude: number;
                            Latitude: number;
                        }, {
                            Longitude: number;
                            Latitude: number;
                        }>;
                        AffectedModes: z.ZodObject<{
                            Mode: z.ZodObject<{
                                VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                            }, "strip", z.ZodTypeAny, {
                                VehicleMode: VehicleMode;
                            }, {
                                VehicleMode: VehicleMode;
                            }>;
                        }, "strip", z.ZodTypeAny, {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        }, {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        }>;
                    }, "strip", z.ZodTypeAny, {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }, {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                }, {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                }>>;
                VehicleJourneys: z.ZodOptional<z.ZodObject<{
                    AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
                        VehicleJourneyRef: z.ZodString;
                        Route: z.ZodString;
                        OriginAimedDepartureTime: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }, {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                }, {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                }>>;
            }, "strip", z.ZodTypeAny, {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            }, {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            }>;
            Advice: z.ZodObject<{
                Details: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                Details: string;
            }, {
                Details: string;
            }>;
            Blocking: z.ZodObject<{
                JourneyPlanner: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                JourneyPlanner: boolean;
            }, {
                JourneyPlanner: boolean;
            }>;
            Delays: z.ZodOptional<z.ZodObject<{
                Delay: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                Delay: string;
            }, {
                Delay: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }, {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    }, {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}, {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}>>>, ({
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
} & {
    ReasonType: "MiscellaneousReason";
    MiscellaneousReason: MiscellaneousReason;
} & {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}) | ({
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
} & {
    ReasonType: "PersonnelReason";
    PersonnelReason: PersonnelReason;
} & {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}) | ({
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
} & {
    ReasonType: "EquipmentReason";
    EquipmentReason: EquipmentReason;
} & {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}) | ({
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
} & {
    ReasonType: "EnvironmentReason";
    EnvironmentReason: EnvironmentReason;
} & {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
}), {
    ParticipantRef: string;
    SituationNumber: string;
    Source: {
        SourceType: SourceType;
        TimeOfCommunication: string;
    };
    Progress: Progress;
    ValidityPeriod: {
        StartTime: string;
        EndTime?: string | undefined;
    }[];
    PublicationWindow: {
        StartTime: string;
        EndTime?: string | undefined;
    };
    CreationTime?: string | undefined;
    VersionedAtTime?: string | undefined;
    Version?: number | undefined;
    References?: {
        RelatedToRef: {
            ParticipantRef: string;
            SituationNumber: string;
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
        }[];
    } | undefined;
    Repetitions?: {
        DayType: DayType[];
    } | undefined;
} & (({
    ReasonType: "MiscellaneousReason";
    MiscellaneousReason: MiscellaneousReason;
} | {
    ReasonType: "PersonnelReason";
    PersonnelReason: PersonnelReason;
} | {
    ReasonType: "EquipmentReason";
    EquipmentReason: EquipmentReason;
} | {
    ReasonType: "EnvironmentReason";
    EnvironmentReason: EnvironmentReason;
}) & {
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: {
        InfoLink: {
            Uri: string;
        }[];
    } | undefined;
    Consequences?: {
        Consequence: {
            Condition: "unknown" | "cancelled";
            Severity: Severity;
            Affects: {
                Operators?: {
                    AllOperators?: "" | undefined;
                    AffectedOperator?: {
                        OperatorRef: string;
                        OperatorName?: string | undefined;
                    }[] | undefined;
                } | undefined;
                Networks?: {
                    AffectedNetwork: {
                        VehicleMode: VehicleMode;
                        AllLines?: "" | undefined;
                        AffectedLine?: {
                            LineRef: string;
                            PublishedLineName: string;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            } | undefined;
                            Direction?: {
                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                            } | undefined;
                        }[] | undefined;
                    };
                } | undefined;
                Places?: {
                    AffectedPlace: {
                        PlaceRef: string;
                        PlaceName: string;
                        PlaceCategory: string;
                    }[];
                } | undefined;
                StopPoints?: {
                    AffectedStopPoint: {
                        StopPointRef: string;
                        StopPointName: string;
                        Location: {
                            Longitude: number;
                            Latitude: number;
                        };
                        AffectedModes: {
                            Mode: {
                                VehicleMode: VehicleMode;
                            };
                        };
                    }[];
                } | undefined;
                VehicleJourneys?: {
                    AffectedVehicleJourney: {
                        VehicleJourneyRef: string;
                        Route: string;
                        OriginAimedDepartureTime: string;
                    }[];
                } | undefined;
            };
            Advice: {
                Details: string;
            };
            Blocking: {
                JourneyPlanner: boolean;
            };
            Delays?: {
                Delay: string;
            } | undefined;
        }[];
    } | undefined;
})>;
export declare const situationsSchema: z.ZodObject<{
    PtSituationElement: z.ZodArray<z.ZodEffects<z.ZodIntersection<z.ZodObject<{
        CreationTime: z.ZodOptional<z.ZodString>;
        ParticipantRef: z.ZodString;
        SituationNumber: z.ZodString;
        Version: z.ZodOptional<z.ZodNumber>;
        References: z.ZodOptional<z.ZodObject<{
            RelatedToRef: z.ZodArray<z.ZodObject<{
                CreationTime: z.ZodOptional<z.ZodString>;
                VersionedAtTime: z.ZodOptional<z.ZodString>;
                ParticipantRef: z.ZodString;
                SituationNumber: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }, {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        }, {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        }>>;
        Source: z.ZodObject<{
            SourceType: z.ZodNativeEnum<typeof SourceType>;
            TimeOfCommunication: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            SourceType: SourceType;
            TimeOfCommunication: string;
        }, {
            SourceType: SourceType;
            TimeOfCommunication: string;
        }>;
        VersionedAtTime: z.ZodOptional<z.ZodString>;
        Progress: z.ZodNativeEnum<typeof Progress>;
        ValidityPeriod: z.ZodArray<z.ZodEffects<z.ZodObject<{
            StartTime: z.ZodString;
            EndTime: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            StartTime: string;
            EndTime?: string | undefined;
        }, {
            StartTime: string;
            EndTime?: string | undefined;
        }>, {
            StartTime: string;
            EndTime?: string | undefined;
        }, {
            StartTime: string;
            EndTime?: string | undefined;
        }>, "many">;
        Repetitions: z.ZodOptional<z.ZodObject<{
            DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
        }, "strip", z.ZodTypeAny, {
            DayType: DayType[];
        }, {
            DayType: DayType[];
        }>>;
        PublicationWindow: z.ZodEffects<z.ZodObject<{
            StartTime: z.ZodString;
            EndTime: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            StartTime: string;
            EndTime?: string | undefined;
        }, {
            StartTime: string;
            EndTime?: string | undefined;
        }>, {
            StartTime: string;
            EndTime?: string | undefined;
        }, {
            StartTime: string;
            EndTime?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    }, {
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    }>, z.ZodIntersection<z.ZodDiscriminatedUnion<"ReasonType", [z.ZodObject<{
        ReasonType: z.ZodLiteral<"MiscellaneousReason">;
        MiscellaneousReason: z.ZodNativeEnum<typeof MiscellaneousReason>;
    }, "strip", z.ZodTypeAny, {
        ReasonType: "MiscellaneousReason";
        MiscellaneousReason: MiscellaneousReason;
    }, {
        ReasonType: "MiscellaneousReason";
        MiscellaneousReason: MiscellaneousReason;
    }>, z.ZodObject<{
        ReasonType: z.ZodLiteral<"PersonnelReason">;
        PersonnelReason: z.ZodNativeEnum<typeof PersonnelReason>;
    }, "strip", z.ZodTypeAny, {
        ReasonType: "PersonnelReason";
        PersonnelReason: PersonnelReason;
    }, {
        ReasonType: "PersonnelReason";
        PersonnelReason: PersonnelReason;
    }>, z.ZodObject<{
        ReasonType: z.ZodLiteral<"EquipmentReason">;
        EquipmentReason: z.ZodNativeEnum<typeof EquipmentReason>;
    }, "strip", z.ZodTypeAny, {
        ReasonType: "EquipmentReason";
        EquipmentReason: EquipmentReason;
    }, {
        ReasonType: "EquipmentReason";
        EquipmentReason: EquipmentReason;
    }>, z.ZodObject<{
        ReasonType: z.ZodLiteral<"EnvironmentReason">;
        EnvironmentReason: z.ZodNativeEnum<typeof EnvironmentReason>;
    }, "strip", z.ZodTypeAny, {
        ReasonType: "EnvironmentReason";
        EnvironmentReason: EnvironmentReason;
    }, {
        ReasonType: "EnvironmentReason";
        EnvironmentReason: EnvironmentReason;
    }>]>, z.ZodObject<{
        Planned: z.ZodBoolean;
        Summary: z.ZodString;
        Description: z.ZodString;
        InfoLinks: z.ZodOptional<z.ZodObject<{
            InfoLink: z.ZodArray<z.ZodObject<{
                Uri: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                Uri: string;
            }, {
                Uri: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            InfoLink: {
                Uri: string;
            }[];
        }, {
            InfoLink: {
                Uri: string;
            }[];
        }>>;
        Consequences: z.ZodOptional<z.ZodObject<{
            Consequence: z.ZodArray<z.ZodObject<{
                Condition: z.ZodEnum<["unknown", "cancelled"]>;
                Severity: z.ZodNativeEnum<typeof Severity>;
                Affects: z.ZodObject<{
                    Operators: z.ZodOptional<z.ZodObject<{
                        AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
                        AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            OperatorRef: z.ZodString;
                            OperatorName: z.ZodOptional<z.ZodString>;
                        }, "strip", z.ZodTypeAny, {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }, {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }>, "many">>;
                    }, "strip", z.ZodTypeAny, {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    }, {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    }>>;
                    Networks: z.ZodOptional<z.ZodObject<{
                        AffectedNetwork: z.ZodObject<{
                            VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                            AllLines: z.ZodOptional<z.ZodLiteral<"">>;
                            AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                AffectedOperator: z.ZodOptional<z.ZodObject<{
                                    OperatorRef: z.ZodString;
                                    OperatorName: z.ZodOptional<z.ZodString>;
                                }, "strip", z.ZodTypeAny, {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }, {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }>>;
                                LineRef: z.ZodString;
                                PublishedLineName: z.ZodString;
                                Direction: z.ZodOptional<z.ZodObject<{
                                    DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
                                }, "strip", z.ZodTypeAny, {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                }, {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                }>>;
                            }, "strip", z.ZodTypeAny, {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }, {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }>, "many">>;
                        }, "strip", z.ZodTypeAny, {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        }, {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        }>;
                    }, "strip", z.ZodTypeAny, {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    }, {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    }>>;
                    Places: z.ZodOptional<z.ZodObject<{
                        AffectedPlace: z.ZodArray<z.ZodObject<{
                            PlaceRef: z.ZodString;
                            PlaceName: z.ZodString;
                            PlaceCategory: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }, {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    }, {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    }>>;
                    StopPoints: z.ZodOptional<z.ZodObject<{
                        AffectedStopPoint: z.ZodArray<z.ZodObject<{
                            StopPointRef: z.ZodString;
                            StopPointName: z.ZodString;
                            Location: z.ZodObject<{
                                Longitude: z.ZodNumber;
                                Latitude: z.ZodNumber;
                            }, "strip", z.ZodTypeAny, {
                                Longitude: number;
                                Latitude: number;
                            }, {
                                Longitude: number;
                                Latitude: number;
                            }>;
                            AffectedModes: z.ZodObject<{
                                Mode: z.ZodObject<{
                                    VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                                }, "strip", z.ZodTypeAny, {
                                    VehicleMode: VehicleMode;
                                }, {
                                    VehicleMode: VehicleMode;
                                }>;
                            }, "strip", z.ZodTypeAny, {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            }, {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            }>;
                        }, "strip", z.ZodTypeAny, {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }, {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    }, {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    }>>;
                    VehicleJourneys: z.ZodOptional<z.ZodObject<{
                        AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
                            VehicleJourneyRef: z.ZodString;
                            Route: z.ZodString;
                            OriginAimedDepartureTime: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }, {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    }, {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                }, {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                }>;
                Advice: z.ZodObject<{
                    Details: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    Details: string;
                }, {
                    Details: string;
                }>;
                Blocking: z.ZodObject<{
                    JourneyPlanner: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    JourneyPlanner: boolean;
                }, {
                    JourneyPlanner: boolean;
                }>;
                Delays: z.ZodOptional<z.ZodObject<{
                    Delay: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    Delay: string;
                }, {
                    Delay: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }, {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        }, {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }, {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }>>>, ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "MiscellaneousReason";
        MiscellaneousReason: MiscellaneousReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }) | ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "PersonnelReason";
        PersonnelReason: PersonnelReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }) | ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "EquipmentReason";
        EquipmentReason: EquipmentReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }) | ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "EnvironmentReason";
        EnvironmentReason: EnvironmentReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }), {
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & (({
        ReasonType: "MiscellaneousReason";
        MiscellaneousReason: MiscellaneousReason;
    } | {
        ReasonType: "PersonnelReason";
        PersonnelReason: PersonnelReason;
    } | {
        ReasonType: "EquipmentReason";
        EquipmentReason: EquipmentReason;
    } | {
        ReasonType: "EnvironmentReason";
        EnvironmentReason: EnvironmentReason;
    }) & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    })>, "many">;
}, "strip", z.ZodTypeAny, {
    PtSituationElement: (({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "MiscellaneousReason";
        MiscellaneousReason: MiscellaneousReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }) | ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "PersonnelReason";
        PersonnelReason: PersonnelReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }) | ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "EquipmentReason";
        EquipmentReason: EquipmentReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }) | ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & {
        ReasonType: "EnvironmentReason";
        EnvironmentReason: EnvironmentReason;
    } & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }))[];
}, {
    PtSituationElement: ({
        ParticipantRef: string;
        SituationNumber: string;
        Source: {
            SourceType: SourceType;
            TimeOfCommunication: string;
        };
        Progress: Progress;
        ValidityPeriod: {
            StartTime: string;
            EndTime?: string | undefined;
        }[];
        PublicationWindow: {
            StartTime: string;
            EndTime?: string | undefined;
        };
        CreationTime?: string | undefined;
        VersionedAtTime?: string | undefined;
        Version?: number | undefined;
        References?: {
            RelatedToRef: {
                ParticipantRef: string;
                SituationNumber: string;
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
            }[];
        } | undefined;
        Repetitions?: {
            DayType: DayType[];
        } | undefined;
    } & (({
        ReasonType: "MiscellaneousReason";
        MiscellaneousReason: MiscellaneousReason;
    } | {
        ReasonType: "PersonnelReason";
        PersonnelReason: PersonnelReason;
    } | {
        ReasonType: "EquipmentReason";
        EquipmentReason: EquipmentReason;
    } | {
        ReasonType: "EnvironmentReason";
        EnvironmentReason: EnvironmentReason;
    }) & {
        Planned: boolean;
        Summary: string;
        Description: string;
        InfoLinks?: {
            InfoLink: {
                Uri: string;
            }[];
        } | undefined;
        Consequences?: {
            Consequence: {
                Condition: "unknown" | "cancelled";
                Severity: Severity;
                Affects: {
                    Operators?: {
                        AllOperators?: "" | undefined;
                        AffectedOperator?: {
                            OperatorRef: string;
                            OperatorName?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    Networks?: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode;
                            AllLines?: "" | undefined;
                            AffectedLine?: {
                                LineRef: string;
                                PublishedLineName: string;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                } | undefined;
                                Direction?: {
                                    DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                } | undefined;
                            }[] | undefined;
                        };
                    } | undefined;
                    Places?: {
                        AffectedPlace: {
                            PlaceRef: string;
                            PlaceName: string;
                            PlaceCategory: string;
                        }[];
                    } | undefined;
                    StopPoints?: {
                        AffectedStopPoint: {
                            StopPointRef: string;
                            StopPointName: string;
                            Location: {
                                Longitude: number;
                                Latitude: number;
                            };
                            AffectedModes: {
                                Mode: {
                                    VehicleMode: VehicleMode;
                                };
                            };
                        }[];
                    } | undefined;
                    VehicleJourneys?: {
                        AffectedVehicleJourney: {
                            VehicleJourneyRef: string;
                            Route: string;
                            OriginAimedDepartureTime: string;
                        }[];
                    } | undefined;
                };
                Advice: {
                    Details: string;
                };
                Blocking: {
                    JourneyPlanner: boolean;
                };
                Delays?: {
                    Delay: string;
                } | undefined;
            }[];
        } | undefined;
    }))[];
}>;
export declare const situationExchangeDeliverySchema: z.ZodObject<{
    ResponseTimestamp: z.ZodString;
    Status: z.ZodOptional<z.ZodBoolean>;
    ShortestPossibleCycle: z.ZodOptional<z.ZodString>;
    Situations: z.ZodObject<{
        PtSituationElement: z.ZodArray<z.ZodEffects<z.ZodIntersection<z.ZodObject<{
            CreationTime: z.ZodOptional<z.ZodString>;
            ParticipantRef: z.ZodString;
            SituationNumber: z.ZodString;
            Version: z.ZodOptional<z.ZodNumber>;
            References: z.ZodOptional<z.ZodObject<{
                RelatedToRef: z.ZodArray<z.ZodObject<{
                    CreationTime: z.ZodOptional<z.ZodString>;
                    VersionedAtTime: z.ZodOptional<z.ZodString>;
                    ParticipantRef: z.ZodString;
                    SituationNumber: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }, {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            }, {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            }>>;
            Source: z.ZodObject<{
                SourceType: z.ZodNativeEnum<typeof SourceType>;
                TimeOfCommunication: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                SourceType: SourceType;
                TimeOfCommunication: string;
            }, {
                SourceType: SourceType;
                TimeOfCommunication: string;
            }>;
            VersionedAtTime: z.ZodOptional<z.ZodString>;
            Progress: z.ZodNativeEnum<typeof Progress>;
            ValidityPeriod: z.ZodArray<z.ZodEffects<z.ZodObject<{
                StartTime: z.ZodString;
                EndTime: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                StartTime: string;
                EndTime?: string | undefined;
            }, {
                StartTime: string;
                EndTime?: string | undefined;
            }>, {
                StartTime: string;
                EndTime?: string | undefined;
            }, {
                StartTime: string;
                EndTime?: string | undefined;
            }>, "many">;
            Repetitions: z.ZodOptional<z.ZodObject<{
                DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
            }, "strip", z.ZodTypeAny, {
                DayType: DayType[];
            }, {
                DayType: DayType[];
            }>>;
            PublicationWindow: z.ZodEffects<z.ZodObject<{
                StartTime: z.ZodString;
                EndTime: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                StartTime: string;
                EndTime?: string | undefined;
            }, {
                StartTime: string;
                EndTime?: string | undefined;
            }>, {
                StartTime: string;
                EndTime?: string | undefined;
            }, {
                StartTime: string;
                EndTime?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        }, {
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        }>, z.ZodIntersection<z.ZodDiscriminatedUnion<"ReasonType", [z.ZodObject<{
            ReasonType: z.ZodLiteral<"MiscellaneousReason">;
            MiscellaneousReason: z.ZodNativeEnum<typeof MiscellaneousReason>;
        }, "strip", z.ZodTypeAny, {
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        }, {
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        }>, z.ZodObject<{
            ReasonType: z.ZodLiteral<"PersonnelReason">;
            PersonnelReason: z.ZodNativeEnum<typeof PersonnelReason>;
        }, "strip", z.ZodTypeAny, {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        }, {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        }>, z.ZodObject<{
            ReasonType: z.ZodLiteral<"EquipmentReason">;
            EquipmentReason: z.ZodNativeEnum<typeof EquipmentReason>;
        }, "strip", z.ZodTypeAny, {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        }, {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        }>, z.ZodObject<{
            ReasonType: z.ZodLiteral<"EnvironmentReason">;
            EnvironmentReason: z.ZodNativeEnum<typeof EnvironmentReason>;
        }, "strip", z.ZodTypeAny, {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        }, {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        }>]>, z.ZodObject<{
            Planned: z.ZodBoolean;
            Summary: z.ZodString;
            Description: z.ZodString;
            InfoLinks: z.ZodOptional<z.ZodObject<{
                InfoLink: z.ZodArray<z.ZodObject<{
                    Uri: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    Uri: string;
                }, {
                    Uri: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                InfoLink: {
                    Uri: string;
                }[];
            }, {
                InfoLink: {
                    Uri: string;
                }[];
            }>>;
            Consequences: z.ZodOptional<z.ZodObject<{
                Consequence: z.ZodArray<z.ZodObject<{
                    Condition: z.ZodEnum<["unknown", "cancelled"]>;
                    Severity: z.ZodNativeEnum<typeof Severity>;
                    Affects: z.ZodObject<{
                        Operators: z.ZodOptional<z.ZodObject<{
                            AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
                            AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                OperatorRef: z.ZodString;
                                OperatorName: z.ZodOptional<z.ZodString>;
                            }, "strip", z.ZodTypeAny, {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }, {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }>, "many">>;
                        }, "strip", z.ZodTypeAny, {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        }, {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        }>>;
                        Networks: z.ZodOptional<z.ZodObject<{
                            AffectedNetwork: z.ZodObject<{
                                VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                                AllLines: z.ZodOptional<z.ZodLiteral<"">>;
                                AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                    AffectedOperator: z.ZodOptional<z.ZodObject<{
                                        OperatorRef: z.ZodString;
                                        OperatorName: z.ZodOptional<z.ZodString>;
                                    }, "strip", z.ZodTypeAny, {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }, {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }>>;
                                    LineRef: z.ZodString;
                                    PublishedLineName: z.ZodString;
                                    Direction: z.ZodOptional<z.ZodObject<{
                                        DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
                                    }, "strip", z.ZodTypeAny, {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    }, {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    }>>;
                                }, "strip", z.ZodTypeAny, {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }, {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }>, "many">>;
                            }, "strip", z.ZodTypeAny, {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            }, {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            }>;
                        }, "strip", z.ZodTypeAny, {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        }, {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        }>>;
                        Places: z.ZodOptional<z.ZodObject<{
                            AffectedPlace: z.ZodArray<z.ZodObject<{
                                PlaceRef: z.ZodString;
                                PlaceName: z.ZodString;
                                PlaceCategory: z.ZodString;
                            }, "strip", z.ZodTypeAny, {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }, {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }>, "many">;
                        }, "strip", z.ZodTypeAny, {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        }, {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        }>>;
                        StopPoints: z.ZodOptional<z.ZodObject<{
                            AffectedStopPoint: z.ZodArray<z.ZodObject<{
                                StopPointRef: z.ZodString;
                                StopPointName: z.ZodString;
                                Location: z.ZodObject<{
                                    Longitude: z.ZodNumber;
                                    Latitude: z.ZodNumber;
                                }, "strip", z.ZodTypeAny, {
                                    Longitude: number;
                                    Latitude: number;
                                }, {
                                    Longitude: number;
                                    Latitude: number;
                                }>;
                                AffectedModes: z.ZodObject<{
                                    Mode: z.ZodObject<{
                                        VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                                    }, "strip", z.ZodTypeAny, {
                                        VehicleMode: VehicleMode;
                                    }, {
                                        VehicleMode: VehicleMode;
                                    }>;
                                }, "strip", z.ZodTypeAny, {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                }, {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                }>;
                            }, "strip", z.ZodTypeAny, {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }, {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }>, "many">;
                        }, "strip", z.ZodTypeAny, {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        }, {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        }>>;
                        VehicleJourneys: z.ZodOptional<z.ZodObject<{
                            AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
                                VehicleJourneyRef: z.ZodString;
                                Route: z.ZodString;
                                OriginAimedDepartureTime: z.ZodString;
                            }, "strip", z.ZodTypeAny, {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }, {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }>, "many">;
                        }, "strip", z.ZodTypeAny, {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        }, {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        }>>;
                    }, "strip", z.ZodTypeAny, {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    }, {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    }>;
                    Advice: z.ZodObject<{
                        Details: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        Details: string;
                    }, {
                        Details: string;
                    }>;
                    Blocking: z.ZodObject<{
                        JourneyPlanner: z.ZodBoolean;
                    }, "strip", z.ZodTypeAny, {
                        JourneyPlanner: boolean;
                    }, {
                        JourneyPlanner: boolean;
                    }>;
                    Delays: z.ZodOptional<z.ZodObject<{
                        Delay: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        Delay: string;
                    }, {
                        Delay: string;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }, {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            }, {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            }>>;
        }, "strip", z.ZodTypeAny, {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }, {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }>>>, ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }), {
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & (({
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        } | {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        } | {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        } | {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        }) & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        })>, "many">;
    }, "strip", z.ZodTypeAny, {
        PtSituationElement: (({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }))[];
    }, {
        PtSituationElement: ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & (({
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        } | {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        } | {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        } | {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        }) & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }))[];
    }>;
}, "strip", z.ZodTypeAny, {
    ResponseTimestamp: string;
    Situations: {
        PtSituationElement: (({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }) | ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        } & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }))[];
    };
    Status?: boolean | undefined;
    ShortestPossibleCycle?: string | undefined;
}, {
    ResponseTimestamp: string;
    Situations: {
        PtSituationElement: ({
            ParticipantRef: string;
            SituationNumber: string;
            Source: {
                SourceType: SourceType;
                TimeOfCommunication: string;
            };
            Progress: Progress;
            ValidityPeriod: {
                StartTime: string;
                EndTime?: string | undefined;
            }[];
            PublicationWindow: {
                StartTime: string;
                EndTime?: string | undefined;
            };
            CreationTime?: string | undefined;
            VersionedAtTime?: string | undefined;
            Version?: number | undefined;
            References?: {
                RelatedToRef: {
                    ParticipantRef: string;
                    SituationNumber: string;
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                }[];
            } | undefined;
            Repetitions?: {
                DayType: DayType[];
            } | undefined;
        } & (({
            ReasonType: "MiscellaneousReason";
            MiscellaneousReason: MiscellaneousReason;
        } | {
            ReasonType: "PersonnelReason";
            PersonnelReason: PersonnelReason;
        } | {
            ReasonType: "EquipmentReason";
            EquipmentReason: EquipmentReason;
        } | {
            ReasonType: "EnvironmentReason";
            EnvironmentReason: EnvironmentReason;
        }) & {
            Planned: boolean;
            Summary: string;
            Description: string;
            InfoLinks?: {
                InfoLink: {
                    Uri: string;
                }[];
            } | undefined;
            Consequences?: {
                Consequence: {
                    Condition: "unknown" | "cancelled";
                    Severity: Severity;
                    Affects: {
                        Operators?: {
                            AllOperators?: "" | undefined;
                            AffectedOperator?: {
                                OperatorRef: string;
                                OperatorName?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        Networks?: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode;
                                AllLines?: "" | undefined;
                                AffectedLine?: {
                                    LineRef: string;
                                    PublishedLineName: string;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    } | undefined;
                                    Direction?: {
                                        DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                    } | undefined;
                                }[] | undefined;
                            };
                        } | undefined;
                        Places?: {
                            AffectedPlace: {
                                PlaceRef: string;
                                PlaceName: string;
                                PlaceCategory: string;
                            }[];
                        } | undefined;
                        StopPoints?: {
                            AffectedStopPoint: {
                                StopPointRef: string;
                                StopPointName: string;
                                Location: {
                                    Longitude: number;
                                    Latitude: number;
                                };
                                AffectedModes: {
                                    Mode: {
                                        VehicleMode: VehicleMode;
                                    };
                                };
                            }[];
                        } | undefined;
                        VehicleJourneys?: {
                            AffectedVehicleJourney: {
                                VehicleJourneyRef: string;
                                Route: string;
                                OriginAimedDepartureTime: string;
                            }[];
                        } | undefined;
                    };
                    Advice: {
                        Details: string;
                    };
                    Blocking: {
                        JourneyPlanner: boolean;
                    };
                    Delays?: {
                        Delay: string;
                    } | undefined;
                }[];
            } | undefined;
        }))[];
    };
    Status?: boolean | undefined;
    ShortestPossibleCycle?: string | undefined;
}>;
export declare const serviceDeliverySchema: z.ZodObject<{
    ResponseTimestamp: z.ZodString;
    ProducerRef: z.ZodString;
    ResponseMessageIdentifier: z.ZodString;
    SituationExchangeDelivery: z.ZodObject<{
        ResponseTimestamp: z.ZodString;
        Status: z.ZodOptional<z.ZodBoolean>;
        ShortestPossibleCycle: z.ZodOptional<z.ZodString>;
        Situations: z.ZodObject<{
            PtSituationElement: z.ZodArray<z.ZodEffects<z.ZodIntersection<z.ZodObject<{
                CreationTime: z.ZodOptional<z.ZodString>;
                ParticipantRef: z.ZodString;
                SituationNumber: z.ZodString;
                Version: z.ZodOptional<z.ZodNumber>;
                References: z.ZodOptional<z.ZodObject<{
                    RelatedToRef: z.ZodArray<z.ZodObject<{
                        CreationTime: z.ZodOptional<z.ZodString>;
                        VersionedAtTime: z.ZodOptional<z.ZodString>;
                        ParticipantRef: z.ZodString;
                        SituationNumber: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }, {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                }, {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                }>>;
                Source: z.ZodObject<{
                    SourceType: z.ZodNativeEnum<typeof SourceType>;
                    TimeOfCommunication: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                }, {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                }>;
                VersionedAtTime: z.ZodOptional<z.ZodString>;
                Progress: z.ZodNativeEnum<typeof Progress>;
                ValidityPeriod: z.ZodArray<z.ZodEffects<z.ZodObject<{
                    StartTime: z.ZodString;
                    EndTime: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }>, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }>, "many">;
                Repetitions: z.ZodOptional<z.ZodObject<{
                    DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
                }, "strip", z.ZodTypeAny, {
                    DayType: DayType[];
                }, {
                    DayType: DayType[];
                }>>;
                PublicationWindow: z.ZodEffects<z.ZodObject<{
                    StartTime: z.ZodString;
                    EndTime: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }>, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }, {
                    StartTime: string;
                    EndTime?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            }, {
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            }>, z.ZodIntersection<z.ZodDiscriminatedUnion<"ReasonType", [z.ZodObject<{
                ReasonType: z.ZodLiteral<"MiscellaneousReason">;
                MiscellaneousReason: z.ZodNativeEnum<typeof MiscellaneousReason>;
            }, "strip", z.ZodTypeAny, {
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            }, {
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            }>, z.ZodObject<{
                ReasonType: z.ZodLiteral<"PersonnelReason">;
                PersonnelReason: z.ZodNativeEnum<typeof PersonnelReason>;
            }, "strip", z.ZodTypeAny, {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            }, {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            }>, z.ZodObject<{
                ReasonType: z.ZodLiteral<"EquipmentReason">;
                EquipmentReason: z.ZodNativeEnum<typeof EquipmentReason>;
            }, "strip", z.ZodTypeAny, {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            }, {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            }>, z.ZodObject<{
                ReasonType: z.ZodLiteral<"EnvironmentReason">;
                EnvironmentReason: z.ZodNativeEnum<typeof EnvironmentReason>;
            }, "strip", z.ZodTypeAny, {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            }, {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            }>]>, z.ZodObject<{
                Planned: z.ZodBoolean;
                Summary: z.ZodString;
                Description: z.ZodString;
                InfoLinks: z.ZodOptional<z.ZodObject<{
                    InfoLink: z.ZodArray<z.ZodObject<{
                        Uri: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        Uri: string;
                    }, {
                        Uri: string;
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    InfoLink: {
                        Uri: string;
                    }[];
                }, {
                    InfoLink: {
                        Uri: string;
                    }[];
                }>>;
                Consequences: z.ZodOptional<z.ZodObject<{
                    Consequence: z.ZodArray<z.ZodObject<{
                        Condition: z.ZodEnum<["unknown", "cancelled"]>;
                        Severity: z.ZodNativeEnum<typeof Severity>;
                        Affects: z.ZodObject<{
                            Operators: z.ZodOptional<z.ZodObject<{
                                AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
                                AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                    OperatorRef: z.ZodString;
                                    OperatorName: z.ZodOptional<z.ZodString>;
                                }, "strip", z.ZodTypeAny, {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }, {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }>, "many">>;
                            }, "strip", z.ZodTypeAny, {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            }, {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            }>>;
                            Networks: z.ZodOptional<z.ZodObject<{
                                AffectedNetwork: z.ZodObject<{
                                    VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                                    AllLines: z.ZodOptional<z.ZodLiteral<"">>;
                                    AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        AffectedOperator: z.ZodOptional<z.ZodObject<{
                                            OperatorRef: z.ZodString;
                                            OperatorName: z.ZodOptional<z.ZodString>;
                                        }, "strip", z.ZodTypeAny, {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        }, {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        }>>;
                                        LineRef: z.ZodString;
                                        PublishedLineName: z.ZodString;
                                        Direction: z.ZodOptional<z.ZodObject<{
                                            DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
                                        }, "strip", z.ZodTypeAny, {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        }, {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        }>>;
                                    }, "strip", z.ZodTypeAny, {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }, {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }>, "many">>;
                                }, "strip", z.ZodTypeAny, {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                }, {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                }>;
                            }, "strip", z.ZodTypeAny, {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            }, {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            }>>;
                            Places: z.ZodOptional<z.ZodObject<{
                                AffectedPlace: z.ZodArray<z.ZodObject<{
                                    PlaceRef: z.ZodString;
                                    PlaceName: z.ZodString;
                                    PlaceCategory: z.ZodString;
                                }, "strip", z.ZodTypeAny, {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }, {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }>, "many">;
                            }, "strip", z.ZodTypeAny, {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            }, {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            }>>;
                            StopPoints: z.ZodOptional<z.ZodObject<{
                                AffectedStopPoint: z.ZodArray<z.ZodObject<{
                                    StopPointRef: z.ZodString;
                                    StopPointName: z.ZodString;
                                    Location: z.ZodObject<{
                                        Longitude: z.ZodNumber;
                                        Latitude: z.ZodNumber;
                                    }, "strip", z.ZodTypeAny, {
                                        Longitude: number;
                                        Latitude: number;
                                    }, {
                                        Longitude: number;
                                        Latitude: number;
                                    }>;
                                    AffectedModes: z.ZodObject<{
                                        Mode: z.ZodObject<{
                                            VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                                        }, "strip", z.ZodTypeAny, {
                                            VehicleMode: VehicleMode;
                                        }, {
                                            VehicleMode: VehicleMode;
                                        }>;
                                    }, "strip", z.ZodTypeAny, {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    }, {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    }>;
                                }, "strip", z.ZodTypeAny, {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }, {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }>, "many">;
                            }, "strip", z.ZodTypeAny, {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            }, {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            }>>;
                            VehicleJourneys: z.ZodOptional<z.ZodObject<{
                                AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
                                    VehicleJourneyRef: z.ZodString;
                                    Route: z.ZodString;
                                    OriginAimedDepartureTime: z.ZodString;
                                }, "strip", z.ZodTypeAny, {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }, {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }>, "many">;
                            }, "strip", z.ZodTypeAny, {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            }, {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            }>>;
                        }, "strip", z.ZodTypeAny, {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        }, {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        }>;
                        Advice: z.ZodObject<{
                            Details: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            Details: string;
                        }, {
                            Details: string;
                        }>;
                        Blocking: z.ZodObject<{
                            JourneyPlanner: z.ZodBoolean;
                        }, "strip", z.ZodTypeAny, {
                            JourneyPlanner: boolean;
                        }, {
                            JourneyPlanner: boolean;
                        }>;
                        Delays: z.ZodOptional<z.ZodObject<{
                            Delay: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            Delay: string;
                        }, {
                            Delay: string;
                        }>>;
                    }, "strip", z.ZodTypeAny, {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }, {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }>, "many">;
                }, "strip", z.ZodTypeAny, {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                }, {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                }>>;
            }, "strip", z.ZodTypeAny, {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }, {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }>>>, ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }), {
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & (({
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } | {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } | {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } | {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            }) & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            })>, "many">;
        }, "strip", z.ZodTypeAny, {
            PtSituationElement: (({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }))[];
        }, {
            PtSituationElement: ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & (({
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } | {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } | {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } | {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            }) & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }))[];
        }>;
    }, "strip", z.ZodTypeAny, {
        ResponseTimestamp: string;
        Situations: {
            PtSituationElement: (({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }))[];
        };
        Status?: boolean | undefined;
        ShortestPossibleCycle?: string | undefined;
    }, {
        ResponseTimestamp: string;
        Situations: {
            PtSituationElement: ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & (({
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } | {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } | {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } | {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            }) & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }))[];
        };
        Status?: boolean | undefined;
        ShortestPossibleCycle?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ResponseTimestamp: string;
    ProducerRef: string;
    ResponseMessageIdentifier: string;
    SituationExchangeDelivery: {
        ResponseTimestamp: string;
        Situations: {
            PtSituationElement: (({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }) | ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            } & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }))[];
        };
        Status?: boolean | undefined;
        ShortestPossibleCycle?: string | undefined;
    };
}, {
    ResponseTimestamp: string;
    ProducerRef: string;
    ResponseMessageIdentifier: string;
    SituationExchangeDelivery: {
        ResponseTimestamp: string;
        Situations: {
            PtSituationElement: ({
                ParticipantRef: string;
                SituationNumber: string;
                Source: {
                    SourceType: SourceType;
                    TimeOfCommunication: string;
                };
                Progress: Progress;
                ValidityPeriod: {
                    StartTime: string;
                    EndTime?: string | undefined;
                }[];
                PublicationWindow: {
                    StartTime: string;
                    EndTime?: string | undefined;
                };
                CreationTime?: string | undefined;
                VersionedAtTime?: string | undefined;
                Version?: number | undefined;
                References?: {
                    RelatedToRef: {
                        ParticipantRef: string;
                        SituationNumber: string;
                        CreationTime?: string | undefined;
                        VersionedAtTime?: string | undefined;
                    }[];
                } | undefined;
                Repetitions?: {
                    DayType: DayType[];
                } | undefined;
            } & (({
                ReasonType: "MiscellaneousReason";
                MiscellaneousReason: MiscellaneousReason;
            } | {
                ReasonType: "PersonnelReason";
                PersonnelReason: PersonnelReason;
            } | {
                ReasonType: "EquipmentReason";
                EquipmentReason: EquipmentReason;
            } | {
                ReasonType: "EnvironmentReason";
                EnvironmentReason: EnvironmentReason;
            }) & {
                Planned: boolean;
                Summary: string;
                Description: string;
                InfoLinks?: {
                    InfoLink: {
                        Uri: string;
                    }[];
                } | undefined;
                Consequences?: {
                    Consequence: {
                        Condition: "unknown" | "cancelled";
                        Severity: Severity;
                        Affects: {
                            Operators?: {
                                AllOperators?: "" | undefined;
                                AffectedOperator?: {
                                    OperatorRef: string;
                                    OperatorName?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            Networks?: {
                                AffectedNetwork: {
                                    VehicleMode: VehicleMode;
                                    AllLines?: "" | undefined;
                                    AffectedLine?: {
                                        LineRef: string;
                                        PublishedLineName: string;
                                        AffectedOperator?: {
                                            OperatorRef: string;
                                            OperatorName?: string | undefined;
                                        } | undefined;
                                        Direction?: {
                                            DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                        } | undefined;
                                    }[] | undefined;
                                };
                            } | undefined;
                            Places?: {
                                AffectedPlace: {
                                    PlaceRef: string;
                                    PlaceName: string;
                                    PlaceCategory: string;
                                }[];
                            } | undefined;
                            StopPoints?: {
                                AffectedStopPoint: {
                                    StopPointRef: string;
                                    StopPointName: string;
                                    Location: {
                                        Longitude: number;
                                        Latitude: number;
                                    };
                                    AffectedModes: {
                                        Mode: {
                                            VehicleMode: VehicleMode;
                                        };
                                    };
                                }[];
                            } | undefined;
                            VehicleJourneys?: {
                                AffectedVehicleJourney: {
                                    VehicleJourneyRef: string;
                                    Route: string;
                                    OriginAimedDepartureTime: string;
                                }[];
                            } | undefined;
                        };
                        Advice: {
                            Details: string;
                        };
                        Blocking: {
                            JourneyPlanner: boolean;
                        };
                        Delays?: {
                            Delay: string;
                        } | undefined;
                    }[];
                } | undefined;
            }))[];
        };
        Status?: boolean | undefined;
        ShortestPossibleCycle?: string | undefined;
    };
}>;
export declare const siriSchema: z.ZodObject<{
    ServiceDelivery: z.ZodObject<{
        ResponseTimestamp: z.ZodString;
        ProducerRef: z.ZodString;
        ResponseMessageIdentifier: z.ZodString;
        SituationExchangeDelivery: z.ZodObject<{
            ResponseTimestamp: z.ZodString;
            Status: z.ZodOptional<z.ZodBoolean>;
            ShortestPossibleCycle: z.ZodOptional<z.ZodString>;
            Situations: z.ZodObject<{
                PtSituationElement: z.ZodArray<z.ZodEffects<z.ZodIntersection<z.ZodObject<{
                    CreationTime: z.ZodOptional<z.ZodString>;
                    ParticipantRef: z.ZodString;
                    SituationNumber: z.ZodString;
                    Version: z.ZodOptional<z.ZodNumber>;
                    References: z.ZodOptional<z.ZodObject<{
                        RelatedToRef: z.ZodArray<z.ZodObject<{
                            CreationTime: z.ZodOptional<z.ZodString>;
                            VersionedAtTime: z.ZodOptional<z.ZodString>;
                            ParticipantRef: z.ZodString;
                            SituationNumber: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }, {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    }, {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    }>>;
                    Source: z.ZodObject<{
                        SourceType: z.ZodNativeEnum<typeof SourceType>;
                        TimeOfCommunication: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    }, {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    }>;
                    VersionedAtTime: z.ZodOptional<z.ZodString>;
                    Progress: z.ZodNativeEnum<typeof Progress>;
                    ValidityPeriod: z.ZodArray<z.ZodEffects<z.ZodObject<{
                        StartTime: z.ZodString;
                        EndTime: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }>, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }>, "many">;
                    Repetitions: z.ZodOptional<z.ZodObject<{
                        DayType: z.ZodArray<z.ZodNativeEnum<typeof DayType>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        DayType: DayType[];
                    }, {
                        DayType: DayType[];
                    }>>;
                    PublicationWindow: z.ZodEffects<z.ZodObject<{
                        StartTime: z.ZodString;
                        EndTime: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }>, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }, {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                }, {
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                }>, z.ZodIntersection<z.ZodDiscriminatedUnion<"ReasonType", [z.ZodObject<{
                    ReasonType: z.ZodLiteral<"MiscellaneousReason">;
                    MiscellaneousReason: z.ZodNativeEnum<typeof MiscellaneousReason>;
                }, "strip", z.ZodTypeAny, {
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                }, {
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                }>, z.ZodObject<{
                    ReasonType: z.ZodLiteral<"PersonnelReason">;
                    PersonnelReason: z.ZodNativeEnum<typeof PersonnelReason>;
                }, "strip", z.ZodTypeAny, {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                }, {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                }>, z.ZodObject<{
                    ReasonType: z.ZodLiteral<"EquipmentReason">;
                    EquipmentReason: z.ZodNativeEnum<typeof EquipmentReason>;
                }, "strip", z.ZodTypeAny, {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                }, {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                }>, z.ZodObject<{
                    ReasonType: z.ZodLiteral<"EnvironmentReason">;
                    EnvironmentReason: z.ZodNativeEnum<typeof EnvironmentReason>;
                }, "strip", z.ZodTypeAny, {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                }, {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                }>]>, z.ZodObject<{
                    Planned: z.ZodBoolean;
                    Summary: z.ZodString;
                    Description: z.ZodString;
                    InfoLinks: z.ZodOptional<z.ZodObject<{
                        InfoLink: z.ZodArray<z.ZodObject<{
                            Uri: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            Uri: string;
                        }, {
                            Uri: string;
                        }>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        InfoLink: {
                            Uri: string;
                        }[];
                    }, {
                        InfoLink: {
                            Uri: string;
                        }[];
                    }>>;
                    Consequences: z.ZodOptional<z.ZodObject<{
                        Consequence: z.ZodArray<z.ZodObject<{
                            Condition: z.ZodEnum<["unknown", "cancelled"]>;
                            Severity: z.ZodNativeEnum<typeof Severity>;
                            Affects: z.ZodObject<{
                                Operators: z.ZodOptional<z.ZodObject<{
                                    AllOperators: z.ZodOptional<z.ZodLiteral<"">>;
                                    AffectedOperator: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        OperatorRef: z.ZodString;
                                        OperatorName: z.ZodOptional<z.ZodString>;
                                    }, "strip", z.ZodTypeAny, {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }, {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }>, "many">>;
                                }, "strip", z.ZodTypeAny, {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                }, {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                }>>;
                                Networks: z.ZodOptional<z.ZodObject<{
                                    AffectedNetwork: z.ZodObject<{
                                        VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                                        AllLines: z.ZodOptional<z.ZodLiteral<"">>;
                                        AffectedLine: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            AffectedOperator: z.ZodOptional<z.ZodObject<{
                                                OperatorRef: z.ZodString;
                                                OperatorName: z.ZodOptional<z.ZodString>;
                                            }, "strip", z.ZodTypeAny, {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            }, {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            }>>;
                                            LineRef: z.ZodString;
                                            PublishedLineName: z.ZodString;
                                            Direction: z.ZodOptional<z.ZodObject<{
                                                DirectionRef: z.ZodUnion<[z.ZodLiteral<"inboundTowardsTown">, z.ZodLiteral<"outboundFromTown">]>;
                                            }, "strip", z.ZodTypeAny, {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            }, {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            }>>;
                                        }, "strip", z.ZodTypeAny, {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }, {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }>, "many">>;
                                    }, "strip", z.ZodTypeAny, {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    }, {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    }>;
                                }, "strip", z.ZodTypeAny, {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                }, {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                }>>;
                                Places: z.ZodOptional<z.ZodObject<{
                                    AffectedPlace: z.ZodArray<z.ZodObject<{
                                        PlaceRef: z.ZodString;
                                        PlaceName: z.ZodString;
                                        PlaceCategory: z.ZodString;
                                    }, "strip", z.ZodTypeAny, {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }, {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }>, "many">;
                                }, "strip", z.ZodTypeAny, {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                }, {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                }>>;
                                StopPoints: z.ZodOptional<z.ZodObject<{
                                    AffectedStopPoint: z.ZodArray<z.ZodObject<{
                                        StopPointRef: z.ZodString;
                                        StopPointName: z.ZodString;
                                        Location: z.ZodObject<{
                                            Longitude: z.ZodNumber;
                                            Latitude: z.ZodNumber;
                                        }, "strip", z.ZodTypeAny, {
                                            Longitude: number;
                                            Latitude: number;
                                        }, {
                                            Longitude: number;
                                            Latitude: number;
                                        }>;
                                        AffectedModes: z.ZodObject<{
                                            Mode: z.ZodObject<{
                                                VehicleMode: z.ZodNativeEnum<typeof VehicleMode>;
                                            }, "strip", z.ZodTypeAny, {
                                                VehicleMode: VehicleMode;
                                            }, {
                                                VehicleMode: VehicleMode;
                                            }>;
                                        }, "strip", z.ZodTypeAny, {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        }, {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        }>;
                                    }, "strip", z.ZodTypeAny, {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }, {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }>, "many">;
                                }, "strip", z.ZodTypeAny, {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                }, {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                }>>;
                                VehicleJourneys: z.ZodOptional<z.ZodObject<{
                                    AffectedVehicleJourney: z.ZodArray<z.ZodObject<{
                                        VehicleJourneyRef: z.ZodString;
                                        Route: z.ZodString;
                                        OriginAimedDepartureTime: z.ZodString;
                                    }, "strip", z.ZodTypeAny, {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }, {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }>, "many">;
                                }, "strip", z.ZodTypeAny, {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                }, {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                }>>;
                            }, "strip", z.ZodTypeAny, {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            }, {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            }>;
                            Advice: z.ZodObject<{
                                Details: z.ZodString;
                            }, "strip", z.ZodTypeAny, {
                                Details: string;
                            }, {
                                Details: string;
                            }>;
                            Blocking: z.ZodObject<{
                                JourneyPlanner: z.ZodBoolean;
                            }, "strip", z.ZodTypeAny, {
                                JourneyPlanner: boolean;
                            }, {
                                JourneyPlanner: boolean;
                            }>;
                            Delays: z.ZodOptional<z.ZodObject<{
                                Delay: z.ZodString;
                            }, "strip", z.ZodTypeAny, {
                                Delay: string;
                            }, {
                                Delay: string;
                            }>>;
                        }, "strip", z.ZodTypeAny, {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }, {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    }, {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }, {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }>>>, ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }), {
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & (({
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } | {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } | {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } | {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                }) & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                })>, "many">;
            }, "strip", z.ZodTypeAny, {
                PtSituationElement: (({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            }, {
                PtSituationElement: ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & (({
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } | {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } | {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } | {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                }) & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            }>;
        }, "strip", z.ZodTypeAny, {
            ResponseTimestamp: string;
            Situations: {
                PtSituationElement: (({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            };
            Status?: boolean | undefined;
            ShortestPossibleCycle?: string | undefined;
        }, {
            ResponseTimestamp: string;
            Situations: {
                PtSituationElement: ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & (({
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } | {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } | {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } | {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                }) & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            };
            Status?: boolean | undefined;
            ShortestPossibleCycle?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        ResponseTimestamp: string;
        ProducerRef: string;
        ResponseMessageIdentifier: string;
        SituationExchangeDelivery: {
            ResponseTimestamp: string;
            Situations: {
                PtSituationElement: (({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            };
            Status?: boolean | undefined;
            ShortestPossibleCycle?: string | undefined;
        };
    }, {
        ResponseTimestamp: string;
        ProducerRef: string;
        ResponseMessageIdentifier: string;
        SituationExchangeDelivery: {
            ResponseTimestamp: string;
            Situations: {
                PtSituationElement: ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & (({
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } | {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } | {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } | {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                }) & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            };
            Status?: boolean | undefined;
            ShortestPossibleCycle?: string | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    ServiceDelivery: {
        ResponseTimestamp: string;
        ProducerRef: string;
        ResponseMessageIdentifier: string;
        SituationExchangeDelivery: {
            ResponseTimestamp: string;
            Situations: {
                PtSituationElement: (({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }) | ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                } & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            };
            Status?: boolean | undefined;
            ShortestPossibleCycle?: string | undefined;
        };
    };
}, {
    ServiceDelivery: {
        ResponseTimestamp: string;
        ProducerRef: string;
        ResponseMessageIdentifier: string;
        SituationExchangeDelivery: {
            ResponseTimestamp: string;
            Situations: {
                PtSituationElement: ({
                    ParticipantRef: string;
                    SituationNumber: string;
                    Source: {
                        SourceType: SourceType;
                        TimeOfCommunication: string;
                    };
                    Progress: Progress;
                    ValidityPeriod: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    }[];
                    PublicationWindow: {
                        StartTime: string;
                        EndTime?: string | undefined;
                    };
                    CreationTime?: string | undefined;
                    VersionedAtTime?: string | undefined;
                    Version?: number | undefined;
                    References?: {
                        RelatedToRef: {
                            ParticipantRef: string;
                            SituationNumber: string;
                            CreationTime?: string | undefined;
                            VersionedAtTime?: string | undefined;
                        }[];
                    } | undefined;
                    Repetitions?: {
                        DayType: DayType[];
                    } | undefined;
                } & (({
                    ReasonType: "MiscellaneousReason";
                    MiscellaneousReason: MiscellaneousReason;
                } | {
                    ReasonType: "PersonnelReason";
                    PersonnelReason: PersonnelReason;
                } | {
                    ReasonType: "EquipmentReason";
                    EquipmentReason: EquipmentReason;
                } | {
                    ReasonType: "EnvironmentReason";
                    EnvironmentReason: EnvironmentReason;
                }) & {
                    Planned: boolean;
                    Summary: string;
                    Description: string;
                    InfoLinks?: {
                        InfoLink: {
                            Uri: string;
                        }[];
                    } | undefined;
                    Consequences?: {
                        Consequence: {
                            Condition: "unknown" | "cancelled";
                            Severity: Severity;
                            Affects: {
                                Operators?: {
                                    AllOperators?: "" | undefined;
                                    AffectedOperator?: {
                                        OperatorRef: string;
                                        OperatorName?: string | undefined;
                                    }[] | undefined;
                                } | undefined;
                                Networks?: {
                                    AffectedNetwork: {
                                        VehicleMode: VehicleMode;
                                        AllLines?: "" | undefined;
                                        AffectedLine?: {
                                            LineRef: string;
                                            PublishedLineName: string;
                                            AffectedOperator?: {
                                                OperatorRef: string;
                                                OperatorName?: string | undefined;
                                            } | undefined;
                                            Direction?: {
                                                DirectionRef: "inboundTowardsTown" | "outboundFromTown";
                                            } | undefined;
                                        }[] | undefined;
                                    };
                                } | undefined;
                                Places?: {
                                    AffectedPlace: {
                                        PlaceRef: string;
                                        PlaceName: string;
                                        PlaceCategory: string;
                                    }[];
                                } | undefined;
                                StopPoints?: {
                                    AffectedStopPoint: {
                                        StopPointRef: string;
                                        StopPointName: string;
                                        Location: {
                                            Longitude: number;
                                            Latitude: number;
                                        };
                                        AffectedModes: {
                                            Mode: {
                                                VehicleMode: VehicleMode;
                                            };
                                        };
                                    }[];
                                } | undefined;
                                VehicleJourneys?: {
                                    AffectedVehicleJourney: {
                                        VehicleJourneyRef: string;
                                        Route: string;
                                        OriginAimedDepartureTime: string;
                                    }[];
                                } | undefined;
                            };
                            Advice: {
                                Details: string;
                            };
                            Blocking: {
                                JourneyPlanner: boolean;
                            };
                            Delays?: {
                                Delay: string;
                            } | undefined;
                        }[];
                    } | undefined;
                }))[];
            };
            Status?: boolean | undefined;
            ShortestPossibleCycle?: string | undefined;
        };
    };
}>;
