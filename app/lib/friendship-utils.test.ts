import { describe, expect, it } from "vitest"
import type { FriendshipDto } from "~/lib/api/types"
import { getFriendDisplay } from "~/lib/friendship-utils"

const friendship: FriendshipDto = {
  id: "friendship-id",
  requesterId: "requester-id",
  requesterName: "Requester",
  requesterUsername: "requester",
  addresseeId: "addressee-id",
  addresseeName: "Addressee",
  addresseeUsername: "addressee",
  requestedAt: "2026-01-01T00:00:00Z",
}

describe("getFriendDisplay", () => {
  it("returns the addressee when the current user sent the request", () => {
    expect(getFriendDisplay(friendship, "requester-id")).toEqual({
      name: "Addressee",
      username: "addressee",
    })
  })

  it("returns the requester when the current user received the request", () => {
    expect(getFriendDisplay(friendship, "addressee-id")).toEqual({
      name: "Requester",
      username: "requester",
    })
  })

  it("uses a fallback name when the friend name is missing", () => {
    expect(
      getFriendDisplay(
        { ...friendship, addresseeName: null, addresseeUsername: null },
        "requester-id"
      )
    ).toEqual({ name: "Usuário", username: null })
  })
})
