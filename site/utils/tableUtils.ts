import { UserGroups } from "@create-disruptions-data/shared-ts/enums";

export const getAccountType = (groupName: UserGroups): string => {
    switch (groupName) {
        case UserGroups.systemAdmins:
            return "System Admin";
        case UserGroups.orgAdmins:
            return "Admin";
        case UserGroups.orgPublishers:
            return "Publisher";
        case UserGroups.orgStaff:
            return "Staff";
    }
};
