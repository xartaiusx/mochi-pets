using System;
using System.Collections.Generic;
using System.Linq;

namespace MochiSocial.Data
{
    public static class LocalSocialSignalCatalog
    {
        private static readonly LocalSocialSignal[] Signals =
        {
            new LocalSocialSignal { id = "settling-in", label = "Settling in" },
            new LocalSocialSignal { id = "caring-for-lirabao", label = "Caring for Lirabao" },
            new LocalSocialSignal { id = "waving", label = "Waving hello" }
        };

        public static IReadOnlyList<LocalSocialSignal> All => Signals;

        public static bool TryGetSignal(string signalId, out LocalSocialSignal signal)
        {
            signal = Signals.FirstOrDefault(candidate => string.Equals(candidate.id, signalId, StringComparison.Ordinal));
            return signal != null;
        }
    }

    [Serializable]
    public sealed class LocalSocialSignal
    {
        public string id;
        public string label;
    }
}
