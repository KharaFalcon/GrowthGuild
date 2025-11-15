import React, { useState } from 'react'
import { useGuild } from '../context/GuildContext'
import { useAuth } from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

export function HiveView() {
  const { guildHive, beeSpecies, assignBeeToRoom, removeBeeFromRoom, renameBee, unlockRoom } =
    useGuild()
  const { user } = useAuth()
  const { setPage } = useRouter()

  const [selectedBee, setSelectedBee] = useState<string | null>(null)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [newNickname, setNewNickname] = useState('')

  if (!guildHive) {
    return (
      <div className="page hive-page">
        <div className="hive-container">
          <div className="hive-header">
            <h1>Initialize Your Hive</h1>
            <p>You haven't created your guild hive yet!</p>
          </div>
        </div>
      </div>
    )
  }

  function getSpeciesEmoji(speciesId: string) {
    const species = beeSpecies.find(s => s.id === speciesId)
    return species?.emoji || '🐝'
  }

  function getSpeciesName(speciesId: string) {
    const species = beeSpecies.find(s => s.id === speciesId)
    return species?.name || 'Unknown Bee'
  }

  function handleRenameBee() {
    if (selectedBee && user) {
      renameBee(user.id, selectedBee, newNickname)
      setShowRenameModal(false)
      setNewNickname('')
      setSelectedBee(null)
    }
  }

  function handleUnlockRoom() {
    if (user) {
      unlockRoom(user.id)
    }
  }

  const lockedRoomCount = guildHive.rooms.filter(r => r.level === 0).length
  const canUnlock = guildHive.level >= (guildHive.rooms.filter(r => r.level > 0).length + 1) * 5

  return (
    <div className="page hive-page">
      <div className="hive-header-bar">
        <button className="back-btn" onClick={() => setPage('dashboard')}>
          ← Dashboard
        </button>
        <h1>🏰 {guildHive.hiveName}</h1>
        <div className="hive-stats">
          <span>Lv. {guildHive.level}</span>
          <span>🍯 {guildHive.treasury}</span>
          <span>{guildHive.collectedBees.length} 🐝</span>
        </div>
      </div>

      <div className="hive-main-container">
        {/* Rooms section */}
        <div className="hive-rooms-section">
          <h2>Hive Chambers</h2>
          <div className="rooms-grid">
            {guildHive.rooms.map(room => (
              <div key={room.id} className={`room-card ${room.level === 0 ? 'locked' : 'unlocked'}`}>
                <div className="room-name">{room.name}</div>
                {room.level > 0 ? (
                  <>
                    <div className="room-capacity">
                      Capacity: {room.inhabitants.length}/{room.capacity}
                    </div>
                    {room.bonus && <div className="room-bonus">+{room.bonus}</div>}
                    <div className="room-inhabitants">
                      {room.inhabitants.map(beeId => {
                        const bee = guildHive.collectedBees.find(b => b.id === beeId)
                        return (
                          <div key={beeId} className="inhabitant-badge">
                            <span>{getSpeciesEmoji(bee?.speciesId || '')}</span>
                            <div className="inhabitant-info">
                              <span className="inhabitant-name">{bee?.nickname || getSpeciesName(bee?.speciesId || '')}</span>
                              <span className="inhabitant-level">Lv. {bee?.level}</span>
                            </div>
                            <button
                              className="remove-bee-btn"
                              onClick={() => {
                                if (user && beeId) removeBeeFromRoom(user.id, beeId)
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="room-locked-content">
                    <div className="lock-icon">🔒</div>
                    <p>Unlock at Hive Lv. {(guildHive.rooms.filter(r => r.level > 0).length + 1) * 5}</p>
                    {canUnlock && (
                      <button className="unlock-btn" onClick={handleUnlockRoom}>
                        Unlock Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bee collection */}
        <div className="hive-bees-section">
          <h2>Your Bees</h2>

          {/* Bee eggs */}
          {guildHive.beeEggs.length > 0 && (
            <div className="bee-eggs-container">
              <h3>🥚 Bee Eggs</h3>
              <div className="eggs-grid">
                {guildHive.beeEggs.map(egg => (
                  <div key={egg.id} className="egg-card">
                    <div className="egg-emoji">🥚</div>
                    <div className="egg-species">{getSpeciesName(egg.speciesId)}</div>
                    <div className="egg-progress">
                      <div className="egg-bar" style={{ width: `${egg.fragment}%` }}></div>
                    </div>
                    <div className="egg-percent">{egg.fragment}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collected bees */}
          <div className="bees-grid">
            {guildHive.collectedBees.map(bee => (
              <div
                key={bee.id}
                className={`bee-card ${bee.active ? 'active' : ''} ${bee.evolution}`}
                onClick={() => setSelectedBee(bee.id)}
              >
                <div className="bee-emoji-large">{getSpeciesEmoji(bee.speciesId)}</div>
                <div className="bee-name">{bee.nickname || getSpeciesName(bee.speciesId)}</div>
                <div className="bee-level">Lv. {bee.level}</div>
                <div className="bee-evolution">{bee.evolution}</div>
                <div className="bee-exp-bar">
                  <div className="exp-fill" style={{ width: `${bee.experience}%` }}></div>
                </div>
                {bee.active && <div className="active-badge">Active</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bee detail modal */}
      {selectedBee && (
        <div className="modal-overlay" onClick={() => setSelectedBee(null)}>
          <div className="modal-content bee-detail-modal" onClick={e => e.stopPropagation()}>
            {(() => {
              const bee = guildHive.collectedBees.find(b => b.id === selectedBee)
              const species = bee ? beeSpecies.find(s => s.id === bee.speciesId) : null

              return (
                <>
                  <button className="modal-close" onClick={() => setSelectedBee(null)}>
                    ✕
                  </button>
                  {bee && species && (
                    <>
                      <div className="modal-header">
                        <div className="modal-emoji">{getSpeciesEmoji(bee.speciesId)}</div>
                        <div>
                          <h2>{bee.nickname || species.name}</h2>
                          <p className="rarity" data-rarity={species.rarity}>
                            {species.rarity.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="bee-stats-grid">
                        <div className="stat">
                          <label>Level</label>
                          <div className="stat-value">{bee.level}</div>
                        </div>
                        <div className="stat">
                          <label>Experience</label>
                          <div className="stat-value">{bee.experience}/100</div>
                        </div>
                        <div className="stat">
                          <label>Evolution</label>
                          <div className="stat-value">{bee.evolution}</div>
                        </div>
                        <div className="stat">
                          <label>Status</label>
                          <div className="stat-value">{bee.active ? 'Active' : 'Inactive'}</div>
                        </div>
                      </div>

                      <div className="bee-perks">
                        <p className="primary-perk">✨ Primary: {species.primaryPerk}</p>
                        {species.secondaryPerk && (
                          <p className="secondary-perk">⚡ Secondary: {species.secondaryPerk}</p>
                        )}
                      </div>

                      <p className="bee-description">{species.description}</p>

                      <div className="modal-actions">
                        <button
                          className="action-btn rename-btn"
                          onClick={() => setShowRenameModal(true)}
                        >
                          ✏️ Rename
                        </button>
                        {!bee.active ? (
                          <button
                            className="action-btn assign-btn"
                            onClick={() => {
                              if (user && guildHive.rooms.some(r => r.level > 0)) {
                                // Auto-assign to first available room
                                const availableRoom = guildHive.rooms.find(
                                  r => r.level > 0 && r.inhabitants.length < r.capacity
                                )
                                if (availableRoom && user) {
                                  assignBeeToRoom(user.id, bee.id, availableRoom.id)
                                  setSelectedBee(null)
                                }
                              }
                            }}
                          >
                            🏠 Assign to Room
                          </button>
                        ) : (
                          <button
                            className="action-btn remove-btn"
                            onClick={() => {
                              if (user) {
                                removeBeeFromRoom(user.id, bee.id)
                                setSelectedBee(null)
                              }
                            }}
                          >
                            📤 Remove from Room
                          </button>
                        )}
                      </div>

                      {showRenameModal && (
                        <div className="rename-modal">
                          <input
                            type="text"
                            placeholder="Enter new nickname"
                            value={newNickname}
                            onChange={e => setNewNickname(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === 'Enter') handleRenameBee()
                            }}
                            autoFocus
                          />
                          <div className="rename-actions">
                            <button onClick={handleRenameBee}>Save</button>
                            <button onClick={() => setShowRenameModal(false)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
